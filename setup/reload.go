package main

import (
	"os"
	"fmt"
	"encoding/json"
	helper "main/functions"
	
)

// Function to refresh roster map, free agents, and initial population
func Refresh(espn_s2 string, swid string, league_id int, team_name string, year int, fa_count int) {

	roster_map, free_agents := helper.GetPlayers(league_id, espn_s2, swid, team_name, year, fa_count)
	size := 75
	week := "15"
	threshold := 34.5

	initial_population, _, _, _, _, _  := helper.HelperInitPop(size, week, threshold, roster_map, free_agents)

	// Save roster_map and free_agents to JSON files
	roster_map_json, err := json.Marshal(roster_map)
	if err != nil {
		fmt.Println("Error marshalling roster_map:", err)
	}
	os.WriteFile("../tests/resources/mock_roster.json", roster_map_json, 0644)

	free_agents_json, err := json.Marshal(free_agents)
	if err != nil {
		fmt.Println("Error marshalling free_agents:", err)
	}
	os.WriteFile("../tests/resources/mock_freeagents.json", free_agents_json, 0644)

	// Save initpop to JSON file
	population_json, err := json.Marshal(initial_population)
	if err != nil {
		fmt.Println("Error marshalling roster_map:", err)
	}
	os.WriteFile("../tests/resources/mock_initpop.json", population_json, 0644)
}

func main() {

	Refresh("", "", 424233486, "James's Scary Team", 2024, 150)
}