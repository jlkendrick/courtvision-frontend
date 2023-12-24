package main

import (
	"encoding/json"
	"bytes"
	"fmt"
	"io"
	"os"
	"net/http"
	"sync"
)

// Struct to keep track of the order of the responses
type Response struct {
	Index int
	Players []Player
}

// Struct for how necessary variables are passed to API
type RosterMeta struct {
	LeagueId int    `json:"league_id"`
	TeamName string `json:"team_name"`
	Year     int    `json:"year"`
}

// Struct for how to contruct Players using the returned player data
type Player struct {
	Name 	       string   `json:"name"`
	AvgPoints      float64  `json:"avg_points"`
	Team 	  	   string   `json:"team"`
	InjuryStatus   string   `json:"injury_status"`
	ValidPositions []string `json:"valid_positions"`
}

// Struct for how to construct the map of players
type InnerPlayerMap struct {
	AvgPoints       float64
	Team 	  	    string
	InjuryStatus	string
	ValidPositions  []string
}

// Struct for JSON schedule file that is used to get days a player is playing
type GameSchedule struct {
	EndDate string                `json:"endDate"`
	Games   map[string][]string   `json:"games"`
}


func main() {

	speed_test()

	json_scheule_path := "static/schedule.json"

	// Load JSON schedule file
	json_schedule, err := os.Open(json_scheule_path)
	if err != nil {
		fmt.Println("Error opening json schedule:", err)
	}
	defer json_schedule.Close()

	// Map of matchup # to end date and game dates for each team
	var schedule_map map[string]GameSchedule

	// Read the contents of the json_schedule file
	jsonBytes, err := io.ReadAll(json_schedule)
	if err != nil {
		fmt.Println("Error reading json_schedule:", err)
	}

	// Unmarshal the JSON data into schedule_map
	err = json.Unmarshal(jsonBytes, &schedule_map)
	if err != nil {
		fmt.Println("Error turning jsonBytes into map:", err)
	}


	// List of URLs to send POST requests to
	urls := []string{
		"http://127.0.0.1:8000/get_roster_data/",
		"http://127.0.0.1:8000/get_freeagent_data/",
	}

	// Response channel to receive responses from goroutines
	response_chan := make(chan Response, len(urls))

	// WaitGroup to wait for all goroutines to finish
	var wg sync.WaitGroup

	// Launch goroutine for each URL
	for i, url := range urls {
		wg.Add(1)
		go get_data(i, url, 424233486, "James's Scary Team", 2024, response_chan, &wg)
	}

	// Wait for all goroutines to finish then close the response channel
	go func() {
		wg.Wait()

	close(response_chan)

	}()

	// Collect and sort responses from channel
	responses := make([][]Player, len(urls))
	for response := range response_chan {
		responses[response.Index] = response.Players
	}

	// Create roster_map and free_agent_map from responses
	roster_map := players_to_map(responses[0])
	free_agent_map := players_to_map(responses[1])
	
	fmt.Println(roster_map["Anfernee Simons"].AvgPoints)
	fmt.Println(free_agent_map["Markelle Fultz"].AvgPoints)
}

// Function to get team/league data (list of Players) from API
func get_data(index int, api_url string, league_id int, team_name string, year int, ch chan<-Response, wg *sync.WaitGroup) {
	defer wg.Done()

	// Create roster_meta struct
	roster_meta := RosterMeta{LeagueId: league_id, TeamName: team_name, Year: year}

	// Convert roster_meta to JSON
	json_roster_meta, err := json.Marshal(roster_meta)
	if err != nil {
		fmt.Println("Error", err)
	}

	// Send POST request to API
	response, err := http.Post(api_url, "application/json", bytes.NewBuffer(json_roster_meta))
	if err != nil {
		fmt.Println("Error sending or recieving from api:", err)
	}
	defer response.Body.Close()

	var players []Player

	// Read response body and decode JSON into players slice
	if response.StatusCode == http.StatusOK {
		body, err := io.ReadAll(response.Body)
		if err != nil {
			fmt.Println("Error reading api response:", err)
		}

		err = json.Unmarshal(body, &players)
		if err != nil {
			fmt.Println("Error decoding json response into player list:", err)
		}
	} else {
		fmt.Println("Error: Unexpected status code", response.StatusCode)
	}

	ch <- Response{Index: index, Players: players}
}

// Function to convert players slice to map
func players_to_map(players []Player) map[string]InnerPlayerMap {

	player_map := make(map[string]InnerPlayerMap)

	// Convert players slice to map
	for _, player := range players {

		innerPlayer := InnerPlayerMap{
			AvgPoints:       player.AvgPoints,
			Team: 		     player.Team,
			InjuryStatus:    player.InjuryStatus,
			ValidPositions:  player.ValidPositions,
		}

		player_map[player.Name] = innerPlayer
	}

	return player_map
}