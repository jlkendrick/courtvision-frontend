package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"sync"
)

// Struct to keep track of the order of the responses
type Response struct {
	Index   int
	Players []Player
}

// Struct for how necessary variables are passed to API
type RosterMeta struct {
	LeagueId int    `json:"league_id"`
	EspnS2   string `json:"espn_s2"`
	Swid     string `json:"swid"`
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

	// Run speed test
	// speed_test()

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
	// espn_s2 := "AECHx26irdFs2JD7wAboBU4MVaRiPftjipvFFGqN5TGOn7bI7hJysWd42Wm7kndmWu0wV99ZAVXNQNz5TS8%2FEZqvgdGEkanYbHAFMvBmSaxclakoBO7N5dLmMfOl3r%2FbwHRsAwfOlCTl8uUiDcD33j%2Fi%2BwkU1o03iit9gvdS44u4sgzFABVfEyhlVzc2J0wKS7qwYD%2BeIUXow5PboT6azWpfUKEcnhdfAzPfx1JuHmcjULsbf4385ZEUVBackpHFskc4CXoJL3PapPaiqRYOXvzJKMEalCSvn9UsHLsCQgb5VYVxCAsDGh3eAqFRKRVECIbX0PR9V%2BlG6iLskrcHcnnB"
	// swid := "{BC1331CC-B20C-45FD-80F9-D5A0572D04EF}"
	espn_s2 := ""
	swid := ""
	league_id := 424233486
	team_name := "James's Scary Team"
	year := 2024
	for i, url := range urls {
		wg.Add(1)
		go get_data(i, url, league_id, espn_s2, swid, team_name, year, response_chan, &wg)
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

	fmt.Println(roster_map)
	fmt.Println(free_agent_map)
}

// Function to get team/league data (list of Players) from API
func get_data(index int, api_url string, league_id int, espn_s2 string, swid string, team_name string, year int, ch chan<-Response, wg *sync.WaitGroup) {
	defer wg.Done()

	// Create roster_meta struct
	roster_meta := RosterMeta{LeagueId: league_id, 
							  EspnS2: espn_s2,
							  Swid: swid,
							  TeamName: team_name, 
							  Year: year}

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
		fmt.Println("Error:", response.StatusCode)
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

// Function to 