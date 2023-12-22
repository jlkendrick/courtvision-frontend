package main

import (
	"encoding/json"
	"bytes"
	"fmt"
	"io"
	"net/http"
	"sync"
)

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



func main() {

	// List of URLs to send POST requests to
	urls := []string{
		"http://127.0.0.1:8000/get_roster_data/",
		"http://127.0.0.1:8000/get_free_agents/",
	}

	// Response channel to receive responses from goroutines
	response_chan := make(chan []Player, len(urls))

	// WaitGroup to wait for all goroutines to finish
	var wg sync.WaitGroup

	// Launch goroutine for each URL
	for _, url := range urls {
		wg.Add(1)
		go get_roster_data(url, 424233486, "James's Scary Team", 2024, response_chan, &wg)
	}

	// Wait for all goroutines to finish
	wg.Wait()

	// Close response channel
	close(response_chan)

	roster_map := players_to_map(<-response_chan)
	free_agent_map := players_to_map(<-response_chan)
	
	fmt.Println(roster_map["Anfernee Simons"].AvgPoints)
	fmt.Println(free_agent_map["Jalen Green"].AvgPoints)
}

// Function to get roster data (list of Players) from API
func get_roster_data(api_url string, league_id int, team_name string, year int, ch chan<-[]Player, wg *sync.WaitGroup) {
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
		fmt.Println("Error", err)
	}
	defer response.Body.Close()

	var players []Player

	// Read response body and decode JSON into players slice
	if response.StatusCode == http.StatusOK {
		body, err := io.ReadAll(response.Body)
		if err != nil {
			fmt.Println("Error:", err)
		}

		err = json.Unmarshal(body, &players)
		if err != nil {
			fmt.Println("Error decoding JSON:", err)
		}
	} else {
		fmt.Println("Error: Unexpected status code", response.StatusCode)
	}

	ch <- players
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