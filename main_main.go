package main

import (
	"os"
	"io"
	"fmt"
	"sync"
	"time"
	"bytes"
	"net/http"
	"encoding/json"
)


// Global variable to keep track of the schedule
var schedule_map map[string]GameSchedule

// Start timer
var start = time.Now()

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

	fmt.Println("Time after loading schedule:", time.Since(start))


	// List of URLs to send POST requests to
	urls := []string{
		"http://127.0.0.1:8000/get_roster_data/",
		"http://127.0.0.1:8000/get_freeagent_data/",
	}

	// Response channel to receive responses from goroutines
	response_chan := make(chan PlayersResponse, len(urls))

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
	free_agents := responses[1]

	fmt.Println("Time after getting data:", time.Since(start))

	threshold := 34.0
	optimized_slotting, streamable_players := optimize_slotting(roster_map, "13", threshold)
	fmt.Println("Optimized slotting for intial day:", optimized_slotting[0])
	free_positions := get_unused_positions(optimized_slotting)
	optimize_streaming(free_agents, free_positions, "13", streamable_players)
}


// Function to get team/league data (list of Players) from API
func get_data(index int, api_url string, league_id int, espn_s2 string, swid string, team_name string, year int, ch chan<-PlayersResponse, wg *sync.WaitGroup) {
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

	// Send POST request to server
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

	ch <- PlayersResponse{Index: index, Players: players}
}


// Function to convert players slice to map
func players_to_map(players []Player) map[string]Player {

	player_map := make(map[string]Player)

	// Convert players slice to map
	for _, player := range players {

		// Add player to map
		player_map[player.Name] = player
	}

	return player_map
}

// Function to get the unused positions from the optimal slotting for good players playing for the week
func get_unused_positions(optimal_slotting map[int]map[string]string) map[int][]string {

	// Order that the slice should be in
	order := []string{"PG", "SG", "SF", "PF", "C", "G", "F", "UT1", "UT2", "UT3"}

	// Create map to keep track of unused positions
	unused_positions := make(map[int][]string)

	// Loop through each optimal slotting and add unused positions to map
	for day, schedule := range optimal_slotting {

		// Initialize map for day if it doesn't exist
		if unused_positions[day] == nil {
			unused_positions[day] = []string{}
		}
		
		for _, pos := range order {
			
			// If the position is empty, add it to the unused positions
			if schedule[pos] == "" {
				unused_positions[day] = append(unused_positions[day], pos)
			}
		}
	}
	
	return unused_positions
}