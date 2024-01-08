package main

import (
	"fmt"
	"time"
	"math/rand"
)

// Function to create initial population
func create_initial_population(fas []Player, free_positions map[int][]string, week string, streamable_count int) []Chromosome {

	// Create random seed
	src := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(src)

	chromosomes := make([]Chromosome, 50)

	// Create 50 chromosomes
	for i := 0; i < 1; i++ {

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

		days_in_week := schedule_map[week].GameSpan

		chromosome := Chromosome{Genes: make([]Gene, days_in_week+1), FitnessScore: 0, TotalAquisitions: 0, CumProbTracker: 0.0}

		// Initialize a gene for all days
		for j := 0; j <= days_in_week; j++ {
			chromosome.Genes[j] = Gene{Roster: make(map[string]Player), NewPlayers: make(map[string]bool), Day: j, Acquisitions: 0}
		}

		// Create a gene for each day
		for j := 0; j <= days_in_week; j++ {

			// Get gene for day
			gene := &chromosome.Genes[j]

			acq_count := rng.Intn(3)

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
				for cont && trials < 200 {

					// Get random free agent
					rand_index := rand.Intn(len(fas_copy))
					fa := fas_copy[rand_index]

					// Check if the free agent has a game on the day
					if !contains(schedule_map[week].Games[fa.Team], j) || fa.InjuryStatus == "OUT" {
						continue
					}

					// Get all the positions that the free agent fits in to
					has_match := false
					matches := get_matches(fa.ValidPositions, free_positions_copy[j], &has_match)

					if has_match {

						// Choose the positon that results in the highest "net rostering". Adjuested for choosing the best position for each day
						pos_map := find_best_positions(fa, chromosome, matches, free_positions_copy, j, week, dropped_players)

						fmt.Println("Pos map:", pos_map)
						fmt.Println("day:", j)

						// Remove position from available_positions and player from free agents. Only remove from free_pos on inital day so it doesn't interfere with same day moves
						index_of_pos := index_of(free_positions_copy[j], pos_map[j])
						free_positions_copy[j] = append(free_positions_copy[j][:index_of_pos], free_positions_copy[j][index_of_pos+1:]...)
						fas_copy = remove(fas_copy, rand_index)

						// When added here, counts as a new player
						gene.NewPlayers[pos_map[j]] = true
						gene.Roster[pos_map[j]] = fa
						gene.Acquisitions++
						cont = false

						// Fill other game days with added player because on other days, he can go on the bench
						for day, pos := range pos_map {

								// Add player to gene for that day. When added here, doesn't count as a new player
								chromosome.Genes[day].Roster[pos] = fa
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
func find_best_positions(player Player, chromosome Chromosome, matches []string, free_positions map[int][]string, start_day int, week string, dropped_players map[string]DroppedPlayer) map[int]string {

	// Create random seed
	src := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(src)

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

		// If every position has a player in it, put player in a random position
		if !found_match {
			rand_index := rng.Intn(len(updated_matches))
			pos_map[day] = updated_matches[rand_index]
			dropped_players[player.Name] = DroppedPlayer{Player: chromosome.Genes[day].Roster[pos_map[day]], Countdown: 3}
		}
	}

	return pos_map
}