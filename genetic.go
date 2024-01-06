package main

import (
	"fmt"
	"time"
	"math"
	"math/rand"
)

// Genetic algorithm to optimize streaming moves for the week
func optimize_streaming(free_agent_map []Player, free_positions map[int][]string, week string) {

	// Create initial population
	population := create_initial_population(free_agent_map, free_positions, week)

	// Score fitness of initial population and get total acquisitions
	for i := range population {
		get_acquisitions(&population[i])
		score_fitness(&population[i], week)
		}

	fmt.Println(population[0].TotalAquisitions)
	fmt.Println(population[0].FitnessScore)
	fmt.Println()
	fmt.Println(population[1].TotalAquisitions)
	fmt.Println(population[1].FitnessScore)

	// print_population(population)

	// Evolve population
	// for i := 0; i < 100; i++ {
	// 	population = evolve_population(population, free_agent_map, free_positions, week)
	// }
}

// Function to create initial population
func create_initial_population(fas []Player, free_positions map[int][]string, week string) []Chromosome {

	// Create random seed
	src := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(src)

	chromosomes := make([]Chromosome, 100)

	// Keep track of dropped players
	dropped_players := make(map[string]DroppedPlayer)

	// Create 100 chromosomes
	for i := 0; i < 2; i++ {

		// Create copy of free agents
		fas_copy := make([]Player, len(fas))
		copy(fas_copy, fas)

		days_in_week := schedule_map[week].GameSpan

		chromosome := Chromosome{Genes: make([]Gene, days_in_week+1), FitnessScore: 0, TotalAquisitions: 0}

		// Initialize a gene for all days
		for j := 0; j <= days_in_week; j++ {
			chromosome.Genes[j] = Gene{Players: make(map[string]Player), Day: j, Acquisitions: 0}
		}

		// Create a gene for each day
		for j := 0; j <= days_in_week; j++ {

			// Get gene for day
			gene := &chromosome.Genes[j]

			acq_count := rng.Intn(4)

			// Check if there are enough available positions to make acq_count moves
			if len(free_positions[j]) < acq_count {
				acq_count = len(free_positions[j])
			}

			// Add acq_count players to gene
			for k := 0; k < acq_count; k++ {

				// Get random free agent that fits into free_positions
				cont := true
				for cont {

					// Get random free agent
					rand_index := rand.Intn(len(fas_copy))
					fa := fas_copy[rand_index]

					// Check if the free agent has a game on the day
					if !contains(schedule_map[week].Games[fa.Team], j) || fa.InjuryStatus == "OUT" {
						continue
					}

					// Get all the positions that the free agent fits in to
					has_match := false
					matches := get_matches(fa.ValidPositions, free_positions[j], &has_match)

					if has_match {

						// Choose the positon that results in the highest "net rostering"
						pos := find_best_pos(fa, chromosome, matches, free_positions, j, week)

						// Remove position from available_positions and player from free agents
						index_of_pos := index_of(free_positions[j], pos)
						free_positions[j] = append(free_positions[j][:index_of_pos], free_positions[j][index_of_pos+1:]...)
						fas_copy = remove(fas_copy, rand_index)

						gene.Players[pos] = fa
						gene.Acquisitions++
						cont = false

						// Fill other game days with added player because on other days, he can go on the bench
						cur_day := j
						for _, day := range schedule_map[week].Games[fa.Team] {
							
							// If the day is before or the same as the current day, skip it
							if day <= cur_day {
								continue
							}

							if contains(free_positions[day], pos) {

								// If a player is already in the position, add them to dropped_players
								if player, ok := chromosome.Genes[day].Players[pos]; ok {
									if _, ok := dropped_players[player.Name]; !ok {
										dropped_players[player.Name] = DroppedPlayer{Player: player, Countdown: 3}
									}
								}

								// Add player to gene for that day
								chromosome.Genes[day].Players[pos] = fa
							}
						}

						// Once a player is added, add another player or go to next day
						break
					}
				}
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
	return chromosomes
}

// Function to remove an element from a slice
func remove(slice []Player, index int) []Player {
	return append(slice[:index], slice[index+1:]...)
}

// Function to get the index of an element in a slice
func index_of(slice []string, element string) int {

	for i, e := range slice {

		if e == element {
			return i
		}
	}
	return -1
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
func find_best_pos(player Player, chromosome Chromosome, matches []string, free_positions map[int][]string, start_day int, week string) string {

	// Keep track of the conflicts for each position and the best position
	return_pos := ""
	conflict_counts := map[string]int{"": 100}

	// Loop through each match and find the conflicts for each position
	for _, match := range matches {

		cur_conflicts := 0

		// Loop through each day and find the conflicts for each position
		for _, day := range schedule_map[week].Games[player.Team] {

			// If the day is before or the same as the current day, skip it
			if day < start_day {
				continue
			}

			// If the position has a player in it or is not a available positon for that day, increment the conflict count
			if contains(free_positions[day], match) {
				if _, ok := chromosome.Genes[day].Players[match]; ok {
					cur_conflicts++
				}
			} else {
				cur_conflicts++
			}
		}

		// Add the conflict count to the map
		conflict_counts[match] = cur_conflicts

		// After each match, see if the current matching pos is better than the best position or early return if there are no conflicts
		if conflict_counts[match] == 0 {
			return match
		} else if conflict_counts[match] < conflict_counts[return_pos] {
			return_pos = match
		}
	}

	return return_pos
}

// Function to give fitness score to a chromosome
func score_fitness(chromosome *Chromosome, week string) {

	fitness_score := 0.0
	penalty_factor := 1.0

	// Loop through each day and add the average points for each player with adjustments for lineups that go over the limit
	if chromosome.TotalAquisitions > schedule_map[week].GameSpan + 1 {
		fmt.Println("Over limit")
		penalty_factor = 1.0 / math.Pow(1.3, float64(chromosome.TotalAquisitions - schedule_map[week].GameSpan))
	}
	for _, gene := range chromosome.Genes {
		for _, player := range gene.Players {
			fitness_score += player.AvgPoints
		}
	}

	chromosome.FitnessScore = int(fitness_score * penalty_factor)
}

// Function to get the number of acquisitions in a chromosome
func get_acquisitions(chromosome *Chromosome) {

	acquisitions := 0

	for _, gene := range chromosome.Genes {
		acquisitions += gene.Acquisitions
	}

	chromosome.TotalAquisitions = acquisitions
}

// Function to print a population
func print_population(population []Chromosome) {
	// Print initial population
	order_to_print := []string{"PG", "SG", "SF", "PF", "C", "G", "F", "UT1", "UT2", "UT3"}
	for _, gene := range population[0].Genes {
		fmt.Println("Day:", gene.Day)
		for _, pos := range order_to_print {
			fmt.Println(pos, gene.Players[pos].Name)
		}
	}
}