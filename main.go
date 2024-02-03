package main

import (
	"fmt"
	"sort"
	loaders "main/tests/resources"
	"main/functions"
)

func main() {

	// Load schedule from JSON file
	helper.LoadSchedule("static/schedule.json")

	// League information
	// espn_s2 := ""
	// swid := ""
	// league_id := 424233486
	// team_name := "James's Scary Team"
	// year := 2024
	week := "15"
	// fa_count := 150

	// Set threshold for streamable players
	threshold := 34.5

	// Retrieve team and free agent data from API
	// roster_map, free_agents := helper.GetPlayers(league_id, espn_s2, swid, team_name, year, fa_count)

	// Load team and free agent data from JSON files
	roster_map := loaders.LoadRosterMap("tests/resources/mock_roster.json")
	free_agents := loaders.LoadFreeAgents("tests/resources/mock_freeagents.json")

	// Optimize slotting and get streamable players
	optimal_lineup, streamable_players := helper.OptimizeSlotting(roster_map, week, threshold)
	fmt.Println(len(streamable_players), "streamable players")

	// Use optimal_lineup to get the spots available for streamable players
	free_positions := helper.GetUnusedPositions(optimal_lineup)

	// Create the initial population for the genetic algorithm
	size := 75
	population := make([]helper.Chromosome, size)
	helper.CreateInitialPopulation(size, population, free_agents, free_positions, week, streamable_players)

	comapare_roster := helper.Chromosome{Genes: make([]helper.Gene, 7), FitnessScore: 0, TotalAcquisitions: 0, CumProbTracker: 0.0, DroppedPlayers: make(map[string]helper.DroppedPlayer)}
	for i := 0; i < 7; i++ {
		comapare_roster.Genes[i] = helper.Gene{Roster: make(map[string]helper.Player), NewPlayers: make(map[string]helper.Player), Day: i, Acquisitions: 0}
	}
	helper.InsertStreamablePlayers(streamable_players, free_positions, week, &comapare_roster, streamable_players)
	helper.ScoreFitness(&comapare_roster, week)
	helper.GetTotalAcquisitions(&comapare_roster)
	games_played := 0
	for _, gene := range comapare_roster.Genes {
		games_played += len(gene.Roster)
	}
	fmt.Println("No pickups roster fitness score:", comapare_roster.FitnessScore, "games played:", games_played)

	population = loaders.LoadInitPop("tests/resources/mock_initpop.json")

	// Run the genetic algorithm for 50 generations
	for i := 0; i < 10; i++ {

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
	other_games_played := 0
	for _, gene := range population[len(population)-1].Genes {
		other_games_played += len(gene.Roster)
	}
	fmt.Println("Best chromosome:", population[len(population)-1].TotalAcquisitions, "pickups", population[len(population)-1].FitnessScore, "fitness score", other_games_played, "games played")
	helper.PrintPopulation(population[len(population)-1], free_positions)
}
