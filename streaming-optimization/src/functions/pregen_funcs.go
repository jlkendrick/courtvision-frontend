package helper

import (
	"fmt"
	"encoding/json"
	"net/http"
	"sort"
	"io"
	"bytes"
	"sync"

)

// Function to make HTTP POST requests to API to get a team's roster and free agent data for the league
func GetPlayers(league_id int, espn_s2 string, swid string, team_name string, year int, fa_count int) (map[string]Player, []Player) {

	Request := func (index int, api_url string, league_id int, espn_s2 string, swid string, team_name string, year int, fa_count int, ch chan<-PlayersResponse, wg *sync.WaitGroup) {
		defer wg.Done()
	
		// Create roster_meta struct
		roster_meta := ReqMeta{LeagueId: league_id, 
								  EspnS2: espn_s2,
								  Swid: swid,
								  TeamName: team_name, 
								  Year: year,
								  FaCount: fa_count,}
	
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

	// List of URLs to send POST requests to
	urls := []string{
		"https://espn-fantasy-server-2wfwsao3zq-uc.a.run.app/get_roster_data/",
		"https://espn-fantasy-server-2wfwsao3zq-uc.a.run.app/get_freeagent_data/",
	}

	// Response channel to receive responses from goroutines
	response_chan := make(chan PlayersResponse, len(urls))

	// WaitGroup to wait for all goroutines to finish
	var wg sync.WaitGroup

	// Launch goroutine for each URL
	for i, url := range urls {
		wg.Add(1)
		go Request(i, url, league_id, espn_s2, swid, team_name, year, fa_count, response_chan, &wg)
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

	return PlayersToMap(responses[0]), responses[1]
}

// Finds available slots and players to experiment with on a roster when considering undroppable players and restrictive positions
func OptimizeSlotting(roster_map map[string]Player, week string, threshold float64) (map[int]map[string]Player, []Player) {

	// Convert roster_map to slices and abstract out IR spot. For the first day, pass all players to get_available_slots
	var streamable_players []Player
	var sorted_good_players []Player
	// var ir []Player
	for _, player := range roster_map {

		if player.Injured {
			// ir = append(ir, player)
			continue
		}

		if player.AvgPoints > threshold {
			sorted_good_players = append(sorted_good_players, player)
		} else {
			streamable_players = append(streamable_players, player)
		}
	}

	// Sort good players by average points
	sort.Slice(sorted_good_players, func(i, j int) bool {
		return sorted_good_players[i].AvgPoints > sorted_good_players[j].AvgPoints
	})

	return_table := make(map[int]map[string]Player)

	// Fill return table and put extra IR players on bench
	for i := 0; i <= ScheduleMap[week].GameSpan; i++ {
		return_table[i] = GetAvailableSlots(sorted_good_players, i, week)
	}

	return return_table, streamable_players
}

// Function to get available slots for a given day
func GetAvailableSlots(players []Player, day int, week string) map[string]Player {

	// Priority order of most restrictive positions to funnel streamers into flexible positions
	position_order := []string{"PG", "SG", "SF", "PF", "G", "F", "C", "UT1", "UT2", "UT3", "BE1", "BE2", "BE3"} // For players playing
	
	var playing []Player

	for _, player := range players {

		// Checks if the player is playing on the given day
		if Contains(ScheduleMap[week].Games[player.Team], day) {
			playing = append(playing, player)
		}
	}

	// Find most restrictive positions for players playing
	optimal_slotting := func (playing []Player) map[string]Player {

		sort.Slice(playing, func(i, j int) bool {
			return len(playing[i].ValidPositions) < len(playing[j].ValidPositions)
		})

		// Create struct to keep track of state across recursive function calls
		max_score := CalculateMaxScore(playing)
		p_context := &FitPlayersContext{
			BestLineup: make(map[string]Player), 
			TopScore: 0, 
			MaxScore: max_score, 
			EarlyExit: false,
		}
	
		// Recursive function call
		FitPlayers(playing, make(map[string]Player), position_order, p_context, 0)
	
		// Create response map and fill with best lineup or empty strings for unused positions except for bench spots
		response := make(map[string]Player)
		filter := map[string]bool{"BE1": true, "BE2": true, "BE3": true}
		for _, pos := range position_order {

			if value, ok := p_context.BestLineup[pos]; ok {
				response[pos] = value
				continue
			}
			if _, ok := filter[pos]; !ok {
				response[pos] = Player{}
			}
		}

		return response
	
	}(playing)

	return optimal_slotting

}

// Recursive backtracking function to find most restrictive positions for players
func FitPlayers(players []Player, cur_lineup map[string]Player, position_order []string, ctx *FitPlayersContext, index int) {

	// If we have found a lineup that has the max score, we can send returns to all other recursive calls
	if ctx.EarlyExit {
		return
	}
	
	// If all players have been given positions, check if the current lineup is better than the best lineup
	if len(players) == 0 {
		score := ScoreRoster(cur_lineup)
		// fmt.Println("Score:", score, "Max score:", ctx.MaxScore)
		if score > ctx.TopScore {
			ctx.TopScore = score
			ctx.BestLineup = make(map[string]Player)
			for key, value := range cur_lineup {
				ctx.BestLineup[key] = value
			}
		}
		if score == ctx.MaxScore {
			ctx.EarlyExit = true
		}
		return
	}

	// If we have not gone through all players, try to fit the rest of the players in the lineup
	position := position_order[index]
	found_player := false
	for _, player := range players {
		if Contains(player.ValidPositions, position) {
			found_player = true
			cur_lineup[position] = player

			// Remove player from players slice
			var remaining_players []Player

			for _, p := range players {
				if p.Name != player.Name {
					remaining_players = append(remaining_players, p)
				}
			}

			FitPlayers(remaining_players, cur_lineup, position_order, ctx, index + 1) // Recurse

			delete(cur_lineup, position) // Backtrack
		}
	}

	// If we did not find a player for the position, advance to the next position
	if !found_player {
		FitPlayers(players, cur_lineup, position_order, ctx, index + 1) // Recurse
	}
}

// Function to score a roster based on restricitveness of positions
func ScoreRoster(roster map[string]Player) int {

	// Scoring system
	score_map := make(map[string]int)

	scoring_groups := [][]string{{"PG", "SG", "SF", "PF"}, {"G", "F"}, {"C"}, {"UT1", "UT2", "UT3"}, {"BE1", "BE2", "BE3"}}
	for score, group := range scoring_groups {
		for _, position := range group {
			score_map[position] = 5 - score
		}
	}

	// Score roster
	score := 0
	for pos := range roster {
		score += score_map[pos]
	}

	return score
}

// Function to calculate the max restrictiveness score for a given set of players
func CalculateMaxScore(players []Player) int {

	size := len(players)

	// Max score calulation corresponding with scoring_groups in score_roster
	switch {
		case size <= 4:
			return size * 5
		case size <= 6:
			return 20 + ((size - 4) * 4)
		case size <= 7:
			return 28 + ((size - 6) * 3)
		case size <= 10:
			return 31 + ((size - 7) * 2)
		default:
			return 37 + (size - 10)
	}
}

// Function to get the unused positions from the optimal slotting for good players playing for the week
func GetUnusedPositions(optimal_slotting map[int]map[string]Player) map[int][]string {

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
			if player := schedule[pos]; player.Name == "" {
				unused_positions[day] = append(unused_positions[day], pos)
			}
		}
	}
	
	return unused_positions
}