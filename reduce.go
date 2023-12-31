package main

import (
	"fmt"
	"sort"
	"time"
	"reflect"
)

// Finds available slots and players to experiment with on a roster when considering undroppable players and restrictive positions
func optimize_slotting(roster_map map[string]Player, week string) map[int]map[string]string {

	// Convert roster_map to slices and abstract out IR spot
	var sorted_good_players []Player
	var streamable_players []Player
	var ir_spot Player
	for _, player := range roster_map {
		if player.InjuryStatus == "OUT" && player.AvgPoints > ir_spot.AvgPoints {
			ir_spot = player
			continue
		}
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

	return_table := make(map[int]map[string]string)

	// Fill return table
	for i := 0; i <= schedule_map[week].GameSpan; i++ {
		return_table[i] = get_available_slots(sorted_good_players, i, week)
	}

	fmt.Println("IR spot:", ir_spot)

	return return_table
}

// Function to get available slots for a given day
func get_available_slots(players []Player, day int, week string) map[string]string {

	// Priority order of most restrictive positions to funnel streamers into flexible positions
	position_order := []string{"PG", "SG", "SF", "PF", "G", "F", "C", "UT1", "UT2", "UT3", "BE1", "BE2", "BE3"} // For players playing
	
	var playing []Player
	var not_playing []Player

	for _, player := range players {

		// Checks if the player is playing on the given day
		if !contains(schedule_map[week].Games[player.Team], day) {
			not_playing = append(not_playing, player)		
		} else {
			playing = append(playing, player)
		}
	}

	// Find most restrictive positions for players playing
	optimal_slotting := func (playing []Player) map[string]string {

		sort.Slice(playing, func(i, j int) bool {
			return len(playing[i].ValidPositions) < len(playing[j].ValidPositions)
		})

		// Create struct to keep track of state across recursive function calls
		max_score := calculate_max_score(playing, true)
		p_context := &FitPlayersContext{
			BestLineup: make(map[string]string), 
			TopScore: 0, 
			MaxScore: max_score, 
			EarlyExit: false,
		}
	
		// Recursive function call
		fit_players(playing, true, make(map[string]string), position_order, p_context, 0)

		fmt.Println("Time after playing backtracking:", time.Since(start))
	
		return p_context.BestLineup

	}(playing)

	return optimal_slotting

}

// Recursive backtracking function to find most restrictive positions for players
func fit_players(players []Player, playing bool, cur_lineup map[string]string, position_order []string, ctx *FitPlayersContext, index int) {

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

// Function to change positions of players not playing who were assigned to positions for players playing
func remove_dupes(return_table [2]map[string]string, roster_map map[string]Player) [2]map[string]string {

	inverse_position_order := map[string]int{"BE1": 0, "BE2": 1, "BE3": 2, "PF": 3, "SF": 4, "SG": 5, "PG": 6, "G": 7, "F": 8, "C": 9, "UT1": 10, "UT2": 11, "UT3": 12} // For players not playing

	taken := [13]bool{}

	// Loop through players playing and mark their corresponding position-index as used
	for position, index := range inverse_position_order {
		if _, ok := return_table[0][position]; ok {
			taken[index] = true
		}
	}

	// Loop through players not playing and shift their position down to next eligible position if they are in used_by_playing
	for position, player := range return_table[1] {

		// Bool dict of positions the player is eligible for
		eligible_positions := make(map[string]bool)

		for _, pos := range roster_map[player].ValidPositions {
			eligible_positions[pos] = true
		}

		index_of_pos := inverse_position_order[position]

		if taken[index_of_pos] {
			for i := index_of_pos; i < 13; i++ {

				if !taken[i] && eligible_positions[keyOf(i)] {
					taken[i] = true
					delete(return_table[1], position)
					return_table[1][keyOf(i)] = player
					break
				}
			}
		}
	}

	return return_table
}

// Function to get key of a value in a map
func keyOf(value int) string {
	inverse_position_order := map[string]int{"BE1": 0, "BE2": 1, "BE3": 2, "PF": 3, "SF": 4, "SG": 5, "PG": 6, "G": 7, "F": 8, "C": 9, "UT1": 10, "UT2": 11, "UT3": 12} // For players not playing

	for key, val := range inverse_position_order {
		if val == value {
			return key
		}
	}

	return ""
}