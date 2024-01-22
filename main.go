package main

import (
	"fmt"
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

	// // Create the initial population for the genetic algorithm
	initial_population := make([]helper.Chromosome, 50)
	helper.CreateInitialPopulation(50, initial_population, free_agents, free_positions, week, streamable_players)

	order := []string{"PG", "SG", "SF", "PF", "C", "G", "F", "UT1", "UT2", "UT3"}
	for day, gene := range initial_population[49].Genes {
		fmt.Println(day)
		for _, pos := range order {
			fmt.Println(pos, gene.Roster[pos])
		}
		fmt.Println()
	}
}
