package main

import (
	"encoding/json"
	"bytes"
	"fmt"
	"io"
	"net/http"
)

type RosterMeta struct {
	LeagueId int    `json:"league_id"`
	TeamName string `json:"team_name"`
	Year     int    `json:"year"`
}

type Player struct {
	Name 	  string  `json:"name"`
	AvgPoints float64 `json:"avg_points"`
}

func main() {
	temp_roster := get_roster_data(424233486, "James's Scary Team", 2024)
	roster := players_to_map(temp_roster)
	fmt.Println(roster)
	
}

func get_roster_data(league_id int, team_name string, year int) []Player {
	api_url := "http://127.0.0.1:8000/get_roster_data/"

	roster_meta := RosterMeta{LeagueId: league_id, TeamName: team_name, Year: year}

	json_data, err := json.Marshal(roster_meta)
	if err != nil {
		fmt.Println("Error", err)
		return nil
	}

	response, err := http.Post(api_url, "application/json", bytes.NewBuffer(json_data))
	if err != nil {
		fmt.Println("Error", err)
		return nil
	}
	defer response.Body.Close()

	var players []Player

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

func players_to_map(players []Player) map[string]interface{} {
	player_map := make(map[string]interface{})
	for _, player := range players {
		player_map[player.Name] = player.AvgPoints
	}
	return player_map
}