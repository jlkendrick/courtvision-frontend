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
	week := "15"
	fa_count := 150

	// Set threshold for streamable players
	threshold := 34.0

	// Retrieve team and free agent data from API
	roster_map, free_agents := helper.GetPlayers(league_id, espn_s2, swid, team_name, year, fa_count)

	// Optimize slotting and get streamable players
	optimal_lineup, streamable_players := helper.OptimizeSlotting(roster_map, week, threshold)
	fmt.Println(len(streamable_players), "streamable players")

	// Use optimal_lineup to get the spots available for streamable players
	free_positions := helper.GetUnusedPositions(optimal_lineup)

	// Create the initial population for the genetic algorithm
	size := 50
	population := make([]helper.Chromosome, size)
	helper.CreateInitialPopulation(size, population, free_agents, free_positions, week, streamable_players)

	// Run the genetic algorithm for 50 generations
	for i := 0; i < 50; i++ {

		// Score fitness of initial population and get total acquisitions
		for i := 0; i < len(population); i++ {
			helper.GetTotalAcquisitions(&population[i])
			helper.ScoreFitness(&population[i], week)
		}

		// Sort population by increasing fitness score
		sort.Slice(population, func(i, j int) bool {
			return population[i].FitnessScore < population[j].FitnessScore
		})

		population = helper.EvolvePopulation(size, population, free_agents, free_positions, streamable_players, week)

		// Print the max fitness score of the population
		fmt.Println("Max fitness score:", population[len(population)-1].FitnessScore)
	}

	// Pring the best chromosome
	fmt.Println("Best chromosome:", population[len(population)-1].TotalAcquisitions)
	helper.PrintPopulation(population[len(population)-1], free_positions)
}
