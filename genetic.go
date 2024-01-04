package main

import (
	"fmt"
	"math/rand"
)

// Genetic algorithm to optimize streaming moves for the week
func optimize_streaming(free_agent_map []Player, free_positions map[int]map[string]string, week string) {

	create_initial_population := func(fas []Player, free_positions map[int]map[string]string, week string) Chromosome {

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
				acq_count := rand.Intn(3)

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

						// Check if fa fits into free_positions
						for pos := range available_positions {
							if contains(fa.ValidPositions, pos) {
								// Remove position from available_positions and player from free agents
								delete(available_positions, pos)
								fas = remove(fas_copy, rand_index)

								gene.Players[pos] = fa
								gene.Acquisitions++
								cont = false

								// Fill other days with added player
								for _, day := range schedule_map[week].Games[fa.Team] {
									if _, ok := free_positions[day]; ok {

										// If a player is already in the position, add them to dropped_players
										if player, ok := chromosome.Genes[day].Players[pos]; ok{
											if _, ok := dropped_players[player.Name]; !ok {
												dropped_players[player.Name] = DroppedPlayer{Player: player, Countdown: 3}
											}
										}

										// Add player to gene for that day
										gene.Players[pos] = fa
									}
								}

								// Once a player is added, add another player or go to next day
								break
							}
						}
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
			return chromosome
		}
		return Chromosome{}
	}

	// Create initial population
	population := create_initial_population(free_agent_map, free_positions, week)

	// Print initial population
	fmt.Println(population)

	// Evolve population
	// for i := 0; i < 100; i++ {
	// 	population = evolve_population(population, free_agent_map, free_positions, week)
	// }
}

// Function to remove an element from a slice
func remove(slice []Player, index int) []Player {
	return append(slice[:index], slice[index+1:]...)
}