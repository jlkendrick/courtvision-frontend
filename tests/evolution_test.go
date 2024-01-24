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
	population := loaders.LoadInitPop()
	size := len(population)
	week := "13"

	optimal_lineup, streamable_players := OptimizeSlotting(population[0].Genes[0].Roster, week, 35.0)
	free_positions := GetUnusedPositions(optimal_lineup)

	// Make sure population is sorted
	for i := 0; i < size-1; i++ {
		if population[i].FitnessScore > population[i+1].FitnessScore {
			t.Errorf("Population not sorted at index %d", i)
		}
	}

	AssignCumProbs(population, size)

	// Make sure CumProbTrackers are assigned
	for i := 0; i < size; i++ {
		if population[i].CumProbTracker == 0 {
			t.Errorf("CumProb not assigned to chromosome %d", i)
		}
	}

	next_generation := make([]Chromosome, size)

	// Implement elitism
	next_generation[size] = population[size]
	next_generation[size] = population[size]
	
	for i := 0; i < size-1; i++ {
		
		// Get parents
		parent1 := SelectFirstParent(population)
		parent2 := SelectSecondParent(population)


		// Get children
		child1, child2 := GetChildren(parent1, parent2, free_agents, free_positions, streamable_players, week)

		// Add children to evolved population
		next_generation[i*2] = child1
		next_generation[i*2+1] = child2
		
	}
}