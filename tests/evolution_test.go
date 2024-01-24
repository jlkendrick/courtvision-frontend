package tests

import (
	. "main/functions"
	"main/tests/resources"
	"testing"
)

func TestEvolutionIntegration(t *testing.T) {


}

func TestCrossover(t *testing.T) {

	LoadSchedule("../static/schedule.json")

	free_agents := loaders.LoadFreeAgents()
	roster_map := loaders.LoadRosterMap()
	week := "13"

	optimal_lineup, streamable_players := OptimizeSlotting(roster_map, week, 35.0)
	free_positions := GetUnusedPositions(optimal_lineup)

	population := loaders.LoadInitPop()
	size := len(population)

	// Test crossover
	parent1 := population[size/2]
	parent2 := population[size/2 + 1]

	// Check 100 sets of children
	for i := 0; i < 100; i++ {

		child1, child2, crossover_point := Crossover(parent1, parent2, free_agents, free_positions, streamable_players, week)

		// Make sure playing streamable players are rostered on the first day
		for _, player := range streamable_players {
			if Contains(ScheduleMap[week].Games[player.Team], 0) {
				if MapContainsValue(child1.Genes[0], player.Name) == "" {
					t.Error("Streamer not in child1")
				}
				if MapContainsValue(child2.Genes[0], player.Name) == "" {
					t.Error("Streamer not in child2")
				}
			}
		}

		// Make sure NewPlayers from original parents are in the children up to the crossover point
		for i := 0; i < crossover_point; i++ {
			for _, player := range parent1.Genes[i].NewPlayers {
				if MapContainsValue(child1.Genes[i], player.Name) == "" {
					t.Error("NewPlayer not in child1")
				}
			}
			for _, player := range parent2.Genes[i].NewPlayers {
				if MapContainsValue(child2.Genes[i], player.Name) == "" {
					t.Error("NewPlayer not in child1")
				}
			}
		}

		// After the crossover point, make sure players in the children are in NewPlayers of the other parent
		for i := crossover_point; i < ScheduleMap[week].GameSpan + 1; i++ {
			for _, player := range child1.Genes[i].NewPlayers {
				if _, ok := parent2.Genes[i].NewPlayers[player.Name]; !ok {
					t.Error("NewPlayer not in parent2")
				}
			}
			for _, player := range child2.Genes[i].NewPlayers {
				if _, ok := parent1.Genes[i].NewPlayers[player.Name]; !ok {
					t.Error("NewPlayer not in parent1")
				}
			}
		}

		// Make sure total acquisitions are correct
		child1_acquisitions := 0
		child2_acquisitions := 0
		for i := 0; i < ScheduleMap[week].GameSpan + 1; i++ {
			child1_acquisitions += len(child1.Genes[i].NewPlayers)
			child2_acquisitions += len(child2.Genes[i].NewPlayers)
		}
		if child1_acquisitions != child1.TotalAcquisitions {
			t.Error("Incorrect child1 acquisitions")
		}
		if child2_acquisitions != child2.TotalAcquisitions {
			t.Error("Incorrect child2 acquisitions")
		}
	}

}

func TestMutate(t *testing.T) {
}