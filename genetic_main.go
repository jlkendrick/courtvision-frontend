package main

import (
	"fmt"
	"math"
	"sort"
	"reflect"
)

// Genetic algorithm to optimize streaming moves for the week
func optimize_streaming(free_agent_map []Player, free_positions map[int][]string, week string, streamable_players []Player) {

	// Create initial population
	population := create_initial_population(free_agent_map, free_positions, week, streamable_players)

	// Evolve population
	for i := 0; i < 10; i++ {

		// Score fitness of initial population and get total acquisitions
		for i := 0; i < len(population); i++ {
			get_total_acquisitions(&population[i])
			score_fitness(&population[i], week)
		}

		// Sort population by increasing fitness score
		sort.Slice(population, func(i, j int) bool {
			return population[i].FitnessScore < population[j].FitnessScore
		})

		// Print initial population
		total_fitness_score := 0
		for _, chromosome := range population {
			total_fitness_score += chromosome.FitnessScore
		}
		fmt.Println("Average fitness score:", total_fitness_score / 50)

		// // Print the best chromosome
		// order := []string{"PG", "SG", "SF", "PF", "C", "G", "F", "UT1", "UT2", "UT3"}
		// fmt.Println("Best chromosome:")
		// fmt.Println("Acquisitions:", population[49].TotalAcquisitions)
		// games_played := 0
		// for _, gene := range population[49].Genes {
		// 	games_played += len(gene.Roster)
		// 	fmt.Println()
		// 	fmt.Println(gene.Day)
		// 	fmt.Println("Acquisitions:", gene.Acquisitions)
		// 	fmt.Println("New players:", gene.NewPlayers)
		// 	for _, pos := range order {
		// 		fmt.Println(pos, gene.Roster[pos].Name)
		// 	}
		// }
		// fmt.Println("No streaming games played:", 8, "vs with streaming", games_played)

		// Evolve population
		population = evolve_population(population, free_agent_map, free_positions, streamable_players, week)
	}

	// Print the best chromosome
	order := []string{"PG", "SG", "SF", "PF", "C", "G", "F", "UT1", "UT2", "UT3"}
	fmt.Println("Best chromosome:")
	fmt.Println("Acquisitions:", population[49].TotalAcquisitions)
	games_played := 0
	for _, gene := range population[49].Genes {
		games_played += len(gene.Roster)
		fmt.Println()
		fmt.Println(gene.Day)
		for _, pos := range order {
			fmt.Println(pos, gene.Roster[pos].Name)
		}
	}

}

// Function to remove an element from a slice
func remove(slice []Player, index int) []Player {
	return append(slice[:index], slice[index+1:]...)
}

// Function to get the index of an element in a slice
func index_of(slice []interface{}, element interface{}) int {

	for i, e := range slice {

		if reflect.DeepEqual(e, element) {
			return i
		}
	}
	return -1
}

// Function to give fitness score to a chromosome
func score_fitness(chromosome *Chromosome, week string) {

	fitness_score := 0.0
	penalty_factor := 1.0

	// Loop through each day and add the average points for each player with adjustments for lineups that go over the limit
	if chromosome.TotalAcquisitions > schedule_map[week].GameSpan + 1 {
		penalty_factor = 1.0 / math.Pow(1.3, float64(chromosome.TotalAcquisitions - schedule_map[week].GameSpan))
	}
	for _, gene := range chromosome.Genes {
		for _, player := range gene.Roster {
			fitness_score += player.AvgPoints
		}
	}

	chromosome.FitnessScore = int(fitness_score * penalty_factor)
}

// Function to get the number of acquisitions in a chromosome
func get_total_acquisitions(chromosome *Chromosome) {

	acquisitions := 0

	for _, gene := range chromosome.Genes {

		acquisitions += gene.Acquisitions
	}

	chromosome.TotalAcquisitions = acquisitions
}

// Function to print a population
func print_population(initial_population []Chromosome) {
	// Print initial population
	order_to_print := []string{"PG", "SG", "SF", "PF", "C", "G", "F", "UT1", "UT2", "UT3"}
	for _, gene := range initial_population[0].Genes {
		fmt.Println("Day:", gene.Day)
		for _, pos := range order_to_print {
			fmt.Println(pos, gene.Roster[pos].Name)
		}
	}
}
