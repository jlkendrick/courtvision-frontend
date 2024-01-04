package main

import (
	"fmt"
	"time"
	"math/rand"
)

// Genetic algorithm to optimize streaming moves for the week
func optimize_streaming(free_agent_map []Player, free_positions map[int]map[string]string, week string) {

	// Create random seed
	src := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(src)

	create_initial_population := func(fas []Player, free_positions map[int]map[string]string, week string) []Chromosome {

		chromosomes := make([]Chromosome, 100)

		// Keep track of dropped players
		dropped_players := make(map[string]DroppedPlayer)

		// Create 100 chromosomes
		for i := 0; i < 1; i++ {

			// Create copy of free agents
			fas_copy := make([]Player, len(fas))
			copy(fas_copy, fas)

			days_in_week := schedule_map[week].GameSpan

			chromosome := Chromosome{Genes: make([]Gene, days_in_week+1), Score: 0}

			// Initialize a gene for all days
			for j := 0; j <= days_in_week; j++ {
				chromosome.Genes[j] = Gene{Players: make(map[string]Player), Day: j, Acquisitions: 0}
			}

			// Create a gene for each day
			for j := 0; j <= days_in_week; j++ {

				// Get gene for day
				gene := &chromosome.Genes[j]

				available_positions := free_positions[j]
				acq_count := rng.Intn(3)

				// Check if there are enough available positions to make acq_count moves
				if len(available_positions) < acq_count {
					acq_count = len(available_positions)
				}

				// Add acq_count players to gene
				for k := 0; k < acq_count; k++ {

					// Get random free agent that fits into free_positions
					cont := true
					for cont {

						// Get random free agent
						rand_index := rand.Intn(len(fas_copy))
						fa := fas_copy[rand_index]

						// Get all the positions that the free agent fits in to
						has_match := false
						matches := get_matches(fa.ValidPositions, available_positions, &has_match)

						if has_match {

							// Get random position from matches if player can't fit into an open position
							pos := matches[rng.Intn(len(matches))]

							// Remove position from available_positions and player from free agents
							delete(available_positions, pos)
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

								if _, ok := free_positions[day]; ok {

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

	// Create initial population
	population := create_initial_population(free_agent_map, free_positions, week)

	// Print initial population
	order_to_print := []string{"PG", "SG", "SF", "PF", "C", "G", "F", "UT1", "UT2", "UT3"}
	for _, gene := range population[0].Genes {
		fmt.Println("Day:", gene.Day)
		for _, pos := range order_to_print {
			fmt.Println(pos, gene.Players[pos].Name)
		}
	}
	aquisitions := func (population []Chromosome) int {
		acquisitions := 0
		for _, gene := range population[0].Genes {
			acquisitions += gene.Acquisitions
		}
		return acquisitions
	}(population)
	fmt.Println("Acquisitions:", aquisitions)
	fmt.Println("Time after creating initial population:", time.Since(start))


	// Evolve population
	// for i := 0; i < 100; i++ {
	// 	population = evolve_population(population, free_agent_map, free_positions, week)
	// }
}

// Function to remove an element from a slice
func remove(slice []Player, index int) []Player {
	return append(slice[:index], slice[index+1:]...)
}

// Function to get all the positions that a free agent fits into
func get_matches(valid_positions []string, available_positions map[string]string, has_match *bool) []string {
	var matches []string
	for _, valid_position := range valid_positions {
		if _, ok := available_positions[valid_position]; ok {
			*has_match = true
			matches = append(matches, valid_position)
		}
	}
	return matches
}