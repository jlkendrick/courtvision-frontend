package main

import (
	"os"
	"io"
	"fmt"
	"sort"
	"sync"
	"time"
	"bytes"
	"reflect"
	"net/http"
	"encoding/json"
)


// Structs to keep track of the order of the responses
type PlayersResponse struct {
	Index   int
	Players []Player
}
type PositionsResponse struct {
	Index     int
	RosterMap map[string]string
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

// Struct for JSON schedule file that is used to get days a player is playing
type GameSchedule struct {
	StartDate string                `json:"startDate"`
	EndDate   string                `json:"endDate"`
	GameSpan  int                   `json:"gameSpan"`
	Games     map[string][]int      `json:"games"`
}

// Struct for keeping track of state across recursive function calls to allow for early exit
type FitPlayersContext struct {
	BestLineup map[string]string
	TopScore   int
	MaxScore   int
	EarlyExit  bool
}


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
	team_name := "Steve's Smart Team"
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

	fmt.Println("Time after getting data:", time.Since(start))

	fmt.Println(roster_map["Darius Garland"].ValidPositions)
	fmt.Println(free_agent_map["Jalen Green"].ValidPositions)
	optimized_slotting := find_available_slots_and_players(roster_map, "10")
	fmt.Println()
	fmt.Println(optimized_slotting[4][0])
	fmt.Println()
	fmt.Println(optimized_slotting[4][1])
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

// Finds available slots and players to experiment with on a roster when considering undroppable players and restrictive positions
func find_available_slots_and_players(roster_map map[string]Player, week string) map[int][2]map[string]string{

	// Convert roster_map to slices
	var sorted_good_players []Player
	var streamable_players []Player
	for _, player := range roster_map {
		if player.AvgPoints > 32 {
			sorted_good_players = append(sorted_good_players, player)
		} else {
			streamable_players = append(streamable_players, player)
		}
	}

	// Sort good players by average points
	sort.Slice(sorted_good_players, func(i, j int) bool {
		return sorted_good_players[i].AvgPoints > sorted_good_players[j].AvgPoints
	})

	var ir_spot Player

	// Abstract out IR spot
	// TODO: Move this before filtering
	for i, player := range sorted_good_players {
		if player.InjuryStatus == "OUT" {
			ir_spot = player
			// Remove player from sorted_good_players
			sorted_good_players = append(sorted_good_players[:i], sorted_good_players[i+1:]...)
			break
		}
	}

	fmt.Println(sorted_good_players)

	return_table := make(map[int][2]map[string]string)

	// Fill return table
	// for i := 0; i <= schedule_map[week].GameSpan; i++ {
	return_table[4] = get_available_slots(sorted_good_players, 4, week)
	// }
	// TODO: Do something with IR spot
	fmt.Println("IR spot:", ir_spot)

	return return_table
}

// Function to get available slots for a given day
func get_available_slots(players []Player, day int, week string) [2]map[string]string {

	// Priority order of most restrictive positions to funnel streamers into flexible positions
	position_order := []string{"PG", "SG", "SF", "PF", "G", "F", "C", "UT1", "UT2", "UT3", "BE1", "BE2", "BE3"}
	inverse_position_order := []string{"BE1", "BE2", "BE3", "PF", "SF", "SG", "PG", "G", "F", "C", "UT1", "UT2", "UT3"}
	
	var playing []Player
	var not_playing []Player

	for _, player := range players {

		// Checks if the player is playing on the given day
		// fmt.Println(player.Name, schedule_map[week].Games[player.Team])
		if !contains(schedule_map[week].Games[player.Team], day) {
			not_playing = append(not_playing, player)		
		} else {
			playing = append(playing, player)
		}
	}

	fmt.Println("Playing:", playing)
	fmt.Println("Not playing:", not_playing)

	// Response channel to receive responses from goroutines
	response_chan := make(chan PositionsResponse, 1)

	// WaitGroup to wait for all goroutines to finish
	var wg sync.WaitGroup
	wg.Add(2)

	// Launch goroutine to find most restrictive positions for players playing
	go func (playing []Player, response_chan chan<-PositionsResponse, wg *sync.WaitGroup) {
		defer wg.Done()

		sort.Slice(playing, func(i, j int) bool {
			return len(playing[i].ValidPositions) < len(playing[j].ValidPositions)
		})

		// Create struct to keep track of state across recursive function calls
		max_score := calculate_max_score(playing, true)
		fmt.Println("Max score:", max_score)
		p_context := &FitPlayersContext{
			BestLineup: make(map[string]string), 
			TopScore: 0, 
			MaxScore: max_score, 
			EarlyExit: false,
		}
	
		// Recursive function call
		fit_players(playing, true, make(map[string]string), position_order, p_context, 0)

		fmt.Println("Time after playing backtracking:", time.Since(start))

		response_chan <- PositionsResponse{0, p_context.BestLineup}

	}(playing, response_chan, &wg)


	// Launch goroutine to find most restrictive positions for players not playing
	go func (not_playing []Player, response_chan chan<-PositionsResponse, wg *sync.WaitGroup) {
		defer wg.Done()

		// Create struct to keep track of state across recursive function calls
		max_score := calculate_max_score(not_playing, false)
		fmt.Println("Max score:", max_score)
		np_context := &FitPlayersContext{
			BestLineup: make(map[string]string), 
			TopScore: 0, 
			MaxScore: max_score, 
			EarlyExit: false,
		}

		// Recursive function call
		fit_players(not_playing, false, make(map[string]string), inverse_position_order, np_context, 0)

		fmt.Println("Time after not playing backtracking:", time.Since(start))

		response_chan <- PositionsResponse{1, np_context.BestLineup}

	}(not_playing, response_chan, &wg)

	// Wait for all goroutines to finish then close the response channel
	go func() {
		wg.Wait()

	close(response_chan)

	}()

	// Collect and sort responses from channel
	var responses [2]map[string]string
	for response := range response_chan {
		responses[response.Index] = response.RosterMap
	}

	return responses
}

// Recursive backtracking function to find most restrictive positions for players
func fit_players(players []Player, playing bool, cur_lineup map[string]string, position_order []string, ctx *FitPlayersContext, index int) {
	// fmt.Println("Remaining players:", players)
	// fmt.Println()
	// fmt.Println("Current lineup:", cur_lineup)
	// fmt.Println()
	fmt.Println("|")

	// If we have found a lineup that has the max score, we can send returns to all other recursive calls
	if ctx.EarlyExit {
		return
	}
	
	// If all players have been given positions, check if the current lineup is better than the best lineup
	if len(players) == 0 {
		score := score_roster(cur_lineup, playing)
		if score > ctx.TopScore {
			ctx.TopScore = score
			ctx.BestLineup = make(map[string]string)
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
	// fmt.Println("Position:", position)
	// fmt.Println()
	// fmt.Println("--------------------")
	found_player := false
	for _, player := range players {
		if contains(player.ValidPositions, position) {
			found_player = true
			cur_lineup[position] = player.Name

			// Remove player from players slice
			var remaining_players []Player

			for _, p := range players {
				if p.Name != player.Name {
					remaining_players = append(remaining_players, p)
				}
			}

			fit_players(remaining_players, playing, cur_lineup, position_order, ctx, index + 1) // Recurse

			delete(cur_lineup, position) // Backtrack
		}
	}

	// If we did not find a player for the position, advance to the next position
	if !found_player {
		fit_players(players, playing, cur_lineup, position_order, ctx, index + 1) // Recurse
	}
}

// Function to score a roster based on restricitveness of positions
func score_roster(roster map[string]string, playing bool) int {

	// Scoring system
	score_map := make(map[string]int)

	if playing {
		scoring_groups := [][]string{{"PG", "SG", "SF", "PF", "C"}, {"G", "F"}, {"UT1", "UT2", "UT3"}, {"BE1", "BE2", "BE3"}}
		for score, group := range scoring_groups {
			for _, position := range group {
				score_map[position] = 4 - score
			}
		}
	} else {
		scoring_groups := [][]string{{"BE1", "BE2", "BE3"}, {"PG", "SG", "SF", "PF", "C"}, {"G", "F"}, {"UT1", "UT2", "UT3"}}
		for score, group := range scoring_groups {
			for _, position := range group {
				score_map[position] = 4 - score
			}
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
func calculate_max_score(players []Player, playing bool) int {

	size := len(players)

	// Max score calulation corresponding with scoring_groups in score_roster
	if playing { switch {
					case size <= 5:
						return size * 4
					case size <= 7:
						return 20 + ((size - 5) * 3)
					case size <= 10:
						return 26 + ((size - 7) * 2)
					default:
						return 32 + (size - 10)}
	} else { switch {
				case size <= 3:
					return size * 4
				case size <= 8:
					return 12 + ((size - 3) * 3)
				case size <= 10:
					return 27 + ((size - 8) * 2)
				default:
						return 31 + (size - 10)}}
}

// Function to check if a slice contains an int
func contains(slice interface{}, value interface{}) bool {

	// Convert slice to reflect.Value
	s := reflect.ValueOf(slice)

	// Check if slice is a slice
	if s.Kind() != reflect.Slice {
		return false
	}

	// Loop through slice and check if value is in slice
	for i := 0; i < s.Len(); i++ {
		if reflect.DeepEqual(s.Index(i).Interface(), value) {
			return true
		}
	}

	return false
}
