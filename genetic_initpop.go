package main

import (
	"os"
	"fmt"
	"time"
	"sort"
	"math/rand"
)

// Function to create initial population
func create_initial_population(fas []Player, free_positions map[int][]string, week string, streamable_players []Player) []Chromosome {

	// Create random seed
	src := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(src)

	streamable_count := len(streamable_players)

	chromosomes := make([]Chromosome, 50)

	// Create 50 chromosomes
	for i := 0; i < 1; i++ {

		days_in_week := schedule_map[week].GameSpan

		chromosome := Chromosome{Genes: make([]Gene, days_in_week+1), FitnessScore: 0, TotalAquisitions: 0, CumProbTracker: 0.0}

		for j := 0; j <= days_in_week; j++ {
			chromosome.Genes[j] = Gene{Roster: make(map[string]Player), NewPlayers: make(map[string]Player), Day: j, Acquisitions: 0}
		}

		// Insert streamable players into chromosome
		insert_streamable_players(streamable_players, free_positions, week, chromosome)

		order := []string{"PG", "SG", "SF", "PF", "C", "G", "F", "UT1", "UT2", "UT3"}

		chromosomes[i] = chromosome

		for i := 0; i < 1; i++ {
			fmt.Println("Chromosome", i)
			for j := range chromosomes[i].Genes {
				fmt.Println()
				fmt.Println("Day", j)
				for _, pos := range order {
					fmt.Println(pos, chromosomes[i].Genes[j].Roster[pos].Name)
				}
			}
			fmt.Println()
		}

		os.Exit(0)


		// Keep track of dropped players
		dropped_players := make(map[string]DroppedPlayer)

		// Create copy of free agents and free positions
		fas_copy := make([]Player, len(fas))
		copy(fas_copy, fas)

		free_positions_copy := make(map[int][]string)
		for k, v := range free_positions {
			free_positions_copy[k] = make([]string, len(v))
			copy(free_positions_copy[k], v)
		}

		// days_in_week := schedule_map[week].GameSpan

		// chromosome := Chromosome{Genes: make([]Gene, days_in_week+1), FitnessScore: 0, TotalAquisitions: 0, CumProbTracker: 0.0}

		// Initialize a gene for all days
		for j := 0; j <= days_in_week; j++ {
			chromosome.Genes[j] = Gene{Roster: make(map[string]Player), NewPlayers: make(map[string]Player), Day: j, Acquisitions: 0}
		}

		// Fill the gene for each day
		for j := 0; j <= days_in_week; j++ {

			// Get gene for day
			gene := &chromosome.Genes[j]

			acq_count := rng.Intn(3 + rng.Intn(2))

			// Check if there are enough available positions to make acq_count moves
			if len(free_positions_copy[j]) < acq_count {
				fmt.Println("Not enough available positions")
				acq_count = len(free_positions_copy[j])
			}

			// Check if there are enough droppable players to make acq_count moves
			if streamable_count < acq_count {
				fmt.Println("Not enough droppable players")
				acq_count = streamable_count
			}

			fmt.Println("# of aquisitions", acq_count)

			// Add acq_count players to gene
			for k := 0; k < acq_count; k++ {

				// Get random free agent that fits into free_positions
				trials := 0
				cont := true
				for cont && trials < 100 {

					// Get random free agent
					rand_index := rand.Intn(len(fas_copy))
					fa := fas_copy[rand_index]

					// Check if the free agent has a game on the day
					if !contains(schedule_map[week].Games[fa.Team], j) || fa.InjuryStatus == "OUT" {
						continue
					}

					// Get all the positions that the player fits in to
					has_match := false
					matches := get_matches(fa.ValidPositions, free_positions_copy[j], &has_match)

					if has_match {

						// Choose the positon that results in the highest "net rostering". Adjusted for choosing the best position for each day
						pos_map := find_best_positions(fa, 
													   chromosome, 
													   matches, 
													   free_positions_copy, 
													   j, 
													   week, 
													   dropped_players, 
													   )


						// If fa was not better than the worst player when added_players was full, skip him
						if pos_map[j] == "" || len(pos_map) == 0 {
							trials++
							continue
						}

						fmt.Println("Pos map:", pos_map)
						fmt.Println("day:", j)

						// Remove position from available_positions and player from free agents. Only remove from free_pos on inital day so it doesn't interfere with same day moves
						index_of_pos := index_of(free_positions_copy[j], pos_map[j])
						free_positions_copy[j] = append(free_positions_copy[j][:index_of_pos], free_positions_copy[j][index_of_pos+1:]...)
						fas_copy = remove(fas_copy, rand_index)

						// When added here, counts as a new player
						gene.NewPlayers[pos_map[j]] = fa
						gene.Acquisitions++
						cont = false

						// Fill other game days with added player because on other days, he can go on the bench
						for day, pos := range pos_map {

								// Add player to gene for that day. When added here, doesn't count as a new player
								chromosome.Genes[day].Roster[pos] = fa
								fmt.Println("Actually adding", fa.Name, "to", pos, "on day", day)
						}

						// Once a player is added, add another player or go to next day
						break
					}
					trials++
				}
				trials = 0
			}
			// After each day, decrement countdown for dropped players
			for name, dp := range dropped_players {
				dp.Countdown--
				if dp.Countdown == 0 {
					delete(dropped_players, name)
					// Add player back to free agents
					fas_copy = append(fas_copy, dp.Player)
				} else {
					dropped_players[name] = dp
				}
			}
		}
		chromosomes[i] = chromosome
	}

	order := []string{"PG", "SG", "SF", "PF", "C", "G", "F", "UT1", "UT2", "UT3"}

	for i := 0; i < 2; i++ {
		fmt.Println("Chromosome", i)
		for j := range chromosomes[i].Genes {
			fmt.Println()
			fmt.Println("Day", j)
			for _, pos := range order {
				fmt.Println(pos, chromosomes[i].Genes[j].Roster[pos].Name)
			}
		}
		fmt.Println()
	}
	return chromosomes
}

// Function to get all the positions that a free agent fits into
func get_matches(valid_positions []string, available_positions []string, has_match *bool) []string {

	var matches []string
	available_positions_map := make(map[string]bool)

	// Create map of available positions
	for _, pos := range available_positions {
		available_positions_map[pos] = true
	}

	// Loop through each valid position and see if it is in the available positions
	for _, valid_position := range valid_positions {

		if _, ok := available_positions_map[valid_position]; ok {
			*has_match = true
			matches = append(matches, valid_position)
		}
	}
	return matches
}


// Function to find the best position to put a player in
func find_best_positions(player Player, 
						 chromosome Chromosome, 
						 matches []string, 
						 free_positions map[int][]string, 
						 start_day int, 
						 week string, 
						 dropped_players map[string]DroppedPlayer, 
						 ) map[int]string {

	pos_map := make(map[int]string)

	// Loop through each day and find the best position for each day
	for _, day := range schedule_map[week].Games[player.Team] {

		// If the day is before or the same as the current day, skip it
		if day < start_day {
			continue
		}

		// If the player is not playing on the day, skip it
		if !contains(schedule_map[week].Games[player.Team], day) {
			continue
		}

		has_match := false
		updated_matches := get_matches(player.ValidPositions, free_positions[day], &has_match)

		// If there are no matches, skip the day
		if !has_match {
			continue
		}

		// Go through matches in decreasing restriction order and assign the player to the first match that doesn't have a player in it
		found_match := false
		for _, pos := range updated_matches {
			
			// If the position doesn't have a player in it, add to pos_map and break
			if _, ok := chromosome.Genes[day].Roster[pos]; !ok {
				pos_map[day] = pos
				found_match = true
				fmt.Println("Adding", player.Name, "to", pos, "on day", day)
				break
			}
		}

		// If every position has a player in it, put player in the position that has the worst player in it
		if !found_match {

			fmt.Println("No opening for", player.Name, "on day", day, "because free positions are", free_positions[day])

			playing := []PlayerScore{}

			// Get all the players that are playing on the day
			for _, pos := range updated_matches {

				player_score := PlayerScore{Player: chromosome.Genes[day].Roster[pos], AvgPoints: chromosome.Genes[day].Roster[pos].AvgPoints, Position: pos}
				playing = append(playing, player_score)
			}

			// Get the worst player
			sort.Slice(playing, func(i, j int) bool {
				return playing[i].AvgPoints < playing[j].AvgPoints })
			worst_player := playing[0]
			
			// If the worst player is worse than the player being added, drop the worst player and add the new player
			if worst_player.AvgPoints < player.AvgPoints {
				delete_all_occurences(&chromosome, worst_player, week, start_day)
				pos_map[day] = worst_player.Position
				dropped_players[worst_player.Player.Name] = DroppedPlayer{Player: worst_player.Player, Countdown: 3}
			} else {
				pos_map[day] = ""
			}
		}
	}

	return pos_map
}

// Function to check if a map contains a value and return the key
func map_contains_value(m Gene, value string) string {

	for k, v := range m.Roster {
		if v.Name == value {
			return k
		}
	}
	return ""
}

// Function to delete all occurences of a value in a chromosome
func delete_all_occurences(chromosome *Chromosome, player_to_drop PlayerScore, week string, start_day int) {

	for _, day := range schedule_map[week].Games[player_to_drop.Player.Team] {

		// If the day is before the current day, skip it
		if day < start_day {
			continue
		}

		key := map_contains_value(chromosome.Genes[day], player_to_drop.Player.Name)
		if key != "" {
			delete(chromosome.Genes[day].Roster, key)
			fmt.Println("Dropping", player_to_drop.Player.Name, "on day", day, "from position", key)
		}
	}
}

// Function to insert initial streamable players into a chromosome
func insert_streamable_players(streamable_players []Player, free_positions map[int][]string, week string, chromosome Chromosome) {

	// Create map to keep track of streamable players
	streamable_map := make(map[string]Player)

	// Insert streamable players into map
	for _, player := range streamable_players {
		streamable_map[player.Name] = player
	}

	// Insert streamable players into chromosome
	for _, player := range streamable_players {

		// Get all the positions that the player fits in to
		has_match := false
		first_game := schedule_map[week].Games[player.Team][0]
		matches := get_matches(player.ValidPositions, free_positions[first_game], &has_match)

		if has_match {

			// Choose the positon that results in the highest "net rostering". Adjusted for choosing the best position for each day
			pos_map := find_best_positions(player, 
										   chromosome, 
										   matches, 
										   free_positions, 
										   first_game, 
										   week, 
										   make(map[string]DroppedPlayer), 
										   )

			// Fill other game days with added player because on other days, he can go on the bench
			for day, pos := range pos_map {

					// Add player to gene for that day. When added here, doesn't count as a new player
					chromosome.Genes[day].Roster[pos] = player
					fmt.Println("Actually adding", player.Name, "to", pos, "on day", day)
			}
		}
	}
}


// full := len(added_players) >= streamable_count

// if full {

// 	// Sort added players by average points so we can drop the worst player if needed
// 	sort.Slice(added_players, func(i, j int) bool {
// 		return added_players[i].AvgPoints < added_players[j].AvgPoints
// 	})

// 	// Get the worst player
// 	worst_player := PlayerScore{Player: added_players[0], AvgPoints: added_players[0].AvgPoints, Position: ""}

// 	// If the worst player is worse than the player being added, drop the worst player and add the new player
// 	if worst_player.AvgPoints < player.AvgPoints {
// 		delete_all_occurences(&chromosome, worst_player, week, start_day)
// 		dropped_players[worst_player.Player.Name] = DroppedPlayer{Player: worst_player.Player, Countdown: 3}
// 	} else {
// 		return make(map[int]string)
// 	}

// } // Proceed with finding the best position for the player based on remaining free positions after dropping the worst player if needed
