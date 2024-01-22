package main

import (
	"fmt"
	"sort"
	"main/functions"
)

func main() {

	// Load schedule from JSON file
	helper.LoadSchedule("static/schedule.json")

	// League information
	espn_s2 := ""
	swid := ""
	league_id := 424233486
	team_name := "James's Scary Team"
	year := 2024
	week := "13"
	fa_count := 150

	// Set threshold for streamable players
	threshold := 33.0

	// Retrieve team and free agent data from API
	roster_map, free_agents := helper.GetPlayers(league_id, espn_s2, swid, team_name, year, fa_count)

	// Optimize slotting and get streamable players
	optimal_lineup, streamable_players := helper.OptimizeSlotting(roster_map, week, threshold)

	// Use optimal_lineup to get the spots available for streamable players
	free_positions := helper.GetUnusedPositions(optimal_lineup)

	// Create the initial population for the genetic algorithm
	size := 50
	population := make([]helper.Chromosome, size)
	helper.CreateInitialPopulation(size, population, free_agents, free_positions, week, streamable_players)

	// Evolve the population
	for i := 0; i < size; i++ {
		
		// Score fitness of initial population and get total acquisitions
		for i := 0; i < len(population); i++ {
			helper.GetTotalAcquisitions(&population[i])
			helper.ScoreFitness(&population[i], week)
		}

		// Sort population by increasing fitness score
		sort.Slice(population, func(i, j int) bool {
			return population[i].FitnessScore < population[j].FitnessScore
		})

		// Print fitness scores
		total_fitness_score := 0
		for _, chromosome := range population {
			total_fitness_score += chromosome.FitnessScore
		}
		fmt.Println("Average fitness score:", total_fitness_score / size)

		// Evolve population
		population = helper.EvolvePopulation(size, population, free_agents, free_positions, streamable_players, week)
	}
}
