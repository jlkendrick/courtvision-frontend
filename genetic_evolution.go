package main

import (
	"fmt"
	"time"
	"sort"
	"math"
	"math/rand"
)

// Function to evolve a population
func evolve_population(population []Chromosome, fas []Player, free_positions map[int][]string, week string) []Chromosome {

	// Fill cumulative probabilities tracker for each chromosome
	assign_cumulative_probabilities(population)

	// evolved_population := make([]Chromosome, 50)

	p1_total := 0
	p2_total := 0

	for i := 0; i < 50; i++ {
		
		// Get parents
		parent1 := select_first_parent(population)
		parent2 := select_second_parent(population)

		p1_total += parent1.FitnessScore
		p2_total += parent2.FitnessScore

		fmt.Println(parent1.FitnessScore)
		fmt.Println(parent2.FitnessScore)
		fmt.Println()

		// Get children
		// child1, child2 := get_children(parent1, parent2, fas, free_positions, week)

		// Add children to evolved population
		// evolved_population[i*2] = child1
		// evolved_population[i*2+1] = child2
	
	}

	fmt.Println("parent 1 average:", p1_total / 50)
	fmt.Println("parent 2 average:", p2_total / 50)

	return population
}

// Function to assign cumulative probabilities to a population for a ranked selection
func assign_cumulative_probabilities(population []Chromosome) {

	// Function to get the probability of a chromosome being selected
	get_probability := func(x int) float64 {
		// return ((7 * (50 - float64(x))) + 55) / (2000)
		return math.Pow(float64(x) / 50, (1.5)) + 0.02
	}

	cum_prob := get_probability(0)
	population[0].CumProbTracker = cum_prob

	// Loop through each chromosome and assign cumulative probabilities
	for i := 1; i < len(population); i++ {
		cum_prob += get_probability(i)
		population[i].CumProbTracker = cum_prob
	}
}

// Function to select the first parent based on a ranked selection
func select_first_parent(population []Chromosome) Chromosome {

	// Get random seed
	src := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(src)
	
	// Get the random number to select the chromosome
	rand_num := rng.Float64() * population[len(population)-1].CumProbTracker

	// Loop through each chromosome and return the first one that is greater than the random number
	for _, chromosome := range population {
		if chromosome.CumProbTracker > rand_num {
			return chromosome
		}
	}

	// If no chromosome is returned, return the last one
	return population[len(population)-1]
}

// Function to select the second parent based on a randomized tournament selection
func select_second_parent(population []Chromosome) Chromosome {

	// Get random seed
	src := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(src)

	tournament := make([][6]Chromosome, 3)

	// Create tournament
	for i := 0; i < 3; i++ {
		
		for j := 0; j < 6; j++ {

			// Insert random chromosome
			tournament[i][j] = population[rng.Intn(len(population))]
		}

		// Sort tournament
		sort.Slice(tournament[i][:], func(k, l int) bool {
			return tournament[i][k].FitnessScore > tournament[i][l].FitnessScore
		})
	}

	return tournament[rng.Intn(3)][2]
}

// Function to get the children of two parents
func get_children(parent1 Chromosome, parent2 Chromosome, fas []Player, free_positions map[int][]string, week string) (Chromosome, Chromosome) {

	// Get random seed
	src := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(src)

	// Create children
	child1 := Chromosome{Genes: make([]Gene, len(parent1.Genes)), FitnessScore: 0, TotalAquisitions: 0, CumProbTracker: 0.0}
	child2 := Chromosome{Genes: make([]Gene, len(parent2.Genes)), FitnessScore: 0, TotalAquisitions: 0, CumProbTracker: 0.0}

	
	
	return child1, child2
}