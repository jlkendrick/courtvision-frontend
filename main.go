package main

import (
	"fmt"
	"main/functions"
)

// Create global variable for schedule map
var schedule_map map[string]helper.GameSchedule = helper.LoadSchedule()

func main() {

	// League information
	espn_s2 := ""
	swid := ""
	league_id := 424233486
	team_name := "James's Scary Team"
	year := 2024
	week := "13"
	// Set threshold for streamable players
	threshold := 33.0

	// Retrieve team and free agent data from API
	roster_map, free_agents := helper.GetPlayers(league_id, espn_s2, swid, team_name, year)

	// Optimize slotting and get streamable players
	optimal_lineup, streamable_players := helper.OptimizeSlotting(roster_map, week, threshold)

	// Use optimal_lineup to get the spots available for streamable players
	free_positions := helper.GetUnusedPositions(optimal_lineup)

	fmt.Println("Free positions:", free_positions[0])
	fmt.Println("Streamable players:", streamable_players[0])
	fmt.Println("Free agents:", free_agents[0])
	fmt.Println()
	order := []string{"PG", "SG", "SF", "PF", "G", "F", "C", "UT1", "UT2", "UT3"}
	for day, roster := range optimal_lineup {
		fmt.Println("Day:", day)
		for _, pos := range order {
			fmt.Println(pos, roster[pos])
		}
		fmt.Println()
	}


	// // Create the initial population for the genetic algorithm
	// initial_poulation := helper.CreateInitialPopulation(free_agents, free_positions, week, streamable_players)

	// fmt.Println("Initial population created", initial_poulation[0])
}
