package main

import (
	"encoding/json"
	"bytes"
	"fmt"
	"io"
	"net/http"
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
	roster := get_roster_data(424233486, "James's Scary Team", 2024)
	roster_map := players_to_map(roster)
	fmt.Println(roster_map["Anfernee Simons"].AvgPoints)
}

// Function to get roster data (list of Players) from API
func get_roster_data(league_id int, team_name string, year int) []Player {

	// Create roster_meta struct
	roster_meta := RosterMeta{LeagueId: league_id, TeamName: team_name, Year: year}

	// Convert roster_meta to JSON
	json_roster_meta, err := json.Marshal(roster_meta)
	if err != nil {
		fmt.Println("Error", err)
		return nil
	}

	api_url := "http://127.0.0.1:8000/get_roster_data/"

	// Send POST request to API
	response, err := http.Post(api_url, "application/json", bytes.NewBuffer(json_roster_meta))
	if err != nil {
		fmt.Println("Error", err)
		return nil
	}
	defer response.Body.Close()

	var players []Player

	// Read response body and decode JSON into players slice
	if response.StatusCode == http.StatusOK {
		body, err := io.ReadAll(response.Body)
		if err != nil {
			fmt.Println("Error:", err)
			return nil
		}

		err = json.Unmarshal(body, &players)
		if err != nil {
			fmt.Println("Error decoding JSON:", err)
			return nil
		}
	} else {
		fmt.Println("Error: Unexpected status code", response.StatusCode)
		return nil
	}

	return players
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