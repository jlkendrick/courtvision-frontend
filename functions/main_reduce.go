package helper

import (
	"reflect"
	"sort"
)

// Finds available slots and players to experiment with on a roster when considering undroppable players and restrictive positions
func OptimizeSlotting(roster_map map[string]Player, week string, threshold float64) (map[int]map[string]Player, []Player) {

	// Convert roster_map to slices and abstract out IR spot. For the first day, pass all players to get_available_slots
	var streamable_players []Player
	var sorted_good_players []Player
	var ir []Player
	for _, player := range roster_map {

		if player.Injured {
			ir = append(ir, player)
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
	for i := 0; i <= schedule_map[week].GameSpan; i++ {
		return_table[i] = get_available_slots(sorted_good_players, i, week)
	}

	return return_table, streamable_players
}

// Function to get available slots for a given day
func get_available_slots(players []Player, day int, week string) map[string]Player {

	// Priority order of most restrictive positions to funnel streamers into flexible positions
	position_order := []string{"PG", "SG", "SF", "PF", "G", "F", "C", "UT1", "UT2", "UT3", "BE1", "BE2", "BE3"} // For players playing
	
	var playing []Player

	for _, player := range players {

		// Checks if the player is playing on the given day
		if Contains(schedule_map[week].Games[player.Team], day) {
			playing = append(playing, player)
		}
	}

	// Find most restrictive positions for players playing
	optimal_slotting := func (playing []Player) map[string]Player {

		sort.Slice(playing, func(i, j int) bool {
			return len(playing[i].ValidPositions) < len(playing[j].ValidPositions)
		})

		// Create struct to keep track of state across recursive function calls
		max_score := calculate_max_score(playing)
		p_context := &FitPlayersContext{
			BestLineup: make(map[string]Player), 
			TopScore: 0, 
			MaxScore: max_score, 
			EarlyExit: false,
		}
	
		// Recursive function call
		fit_players(playing, make(map[string]Player), position_order, p_context, 0)
	
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
func fit_players(players []Player, cur_lineup map[string]Player, position_order []string, ctx *FitPlayersContext, index int) {

	// If we have found a lineup that has the max score, we can send returns to all other recursive calls
	if ctx.EarlyExit {
		return
	}
	
	// If all players have been given positions, check if the current lineup is better than the best lineup
	if len(players) == 0 {
		score := score_roster(cur_lineup)
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

			fit_players(remaining_players, cur_lineup, position_order, ctx, index + 1) // Recurse

			delete(cur_lineup, position) // Backtrack
		}
	}

	// If we did not find a player for the position, advance to the next position
	if !found_player {
		fit_players(players, cur_lineup, position_order, ctx, index + 1) // Recurse
	}
}

// Function to score a roster based on restricitveness of positions
func score_roster(roster map[string]Player) int {

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
func calculate_max_score(players []Player) int {

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

// Function to check if a slice contains an element
func Contains(slice interface{}, value interface{}) bool {

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
