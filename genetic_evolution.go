package main

import (
	"time"
	"sort"
	"math"
	"math/rand"
)

// Function to evolve a population
func evolve_population(population []Chromosome, fas []Player, free_positions map[int][]string, streamable_players []Player, week string) []Chromosome {

	// Fill cumulative probabilities tracker for each chromosome
	assign_cumulative_probabilities(population)

	next_generation := make([]Chromosome, 50)

	for i := 0; i < 25; i++ {

		// // Implement elitism
		// if i == 24 {
		// 	next_generation[i*2+1] = population[i*2+1]
		// }
		
		// Get parents
		parent1 := select_first_parent(population)
		parent2 := select_second_parent(population)


		// Get children
		child1, child2 := get_children(parent1, parent2, fas, free_positions, streamable_players, week)

		// Add children to evolved population
		if i != 26 {
			next_generation[i*2] = child1
			next_generation[i*2+1] = child2
		} else {
			next_generation[i*2] = child1
		}
	
	}

	return next_generation
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

	tournament := make([][5]Chromosome, 3)

	// Create tournament
	for i := 0; i < 3; i++ {
		
		for j := 0; j < 5; j++ {

			// Insert random chromosome
			tournament[i][j] = population[rng.Intn(len(population))]
		}

		// Sort tournament
		sort.Slice(tournament[i][:], func(k, l int) bool {
			return tournament[i][k].FitnessScore > tournament[i][l].FitnessScore
		})
	}

	return tournament[rng.Intn(3)][1]
}

// Function to get the children of two parents
func get_children(parent1 Chromosome, parent2 Chromosome, fas []Player, free_positions map[int][]string, streamable_players []Player, week string) (Chromosome, Chromosome) {

	// Get random seed
	src := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(src)

	// Create children
	child1 := Chromosome{Genes: make([]Gene, schedule_map[week].GameSpan + 1), FitnessScore: 0, TotalAcquisitions: 0, CumProbTracker: 0.0}
	child2 := Chromosome{Genes: make([]Gene, schedule_map[week].GameSpan + 1), FitnessScore: 0, TotalAcquisitions: 0, CumProbTracker: 0.0}

	// Initialize genes
	for j := 0; j <= schedule_map[week].GameSpan; j++ {
		child1.Genes[j] = Gene{Roster: make(map[string]Player), NewPlayers: make(map[string]Player), Day: j, Acquisitions: 0}
		child2.Genes[j] = Gene{Roster: make(map[string]Player), NewPlayers: make(map[string]Player), Day: j, Acquisitions: 0}
	}

	// Get random crossover point between one from the right and left
	crossover_point := rng.Intn(len(parent1.Genes) - 1) + 1
	
	// Fill genes with initial streamers
	cur_streamers1 := make([]Player, len(streamable_players))
	cur_streamers2 := make([]Player, len(streamable_players))
	insert_streamable_players(streamable_players, free_positions, week, &child1, cur_streamers1)
	insert_streamable_players(streamable_players, free_positions, week, &child2, cur_streamers2)

	child1_dropped_players := make(map[string]DroppedPlayer, 0)
	child2_dropped_players := make(map[string]DroppedPlayer, 0)

	for i := 0; i < len(parent1.Genes); i++ {

		// If before crossover point, children are same as the respective parent
		if i < crossover_point {
			
			// Replicate the parent's roster
			for _, player := range parent1.Genes[i].NewPlayers {

				insert_child1(i, player, free_positions, &child1, week, child1_dropped_players, cur_streamers1, streamable_players)
			}

			for _, player := range parent2.Genes[i].NewPlayers {
				
				insert_child2(i, player, free_positions, &child2, week, child2_dropped_players, cur_streamers2, streamable_players)
			}

		} else {

			// Replicate the parent's roster but into the opposite child
			for _, player := range parent1.Genes[i].NewPlayers {

				insert_child2(i, player, free_positions, &child2, week, child2_dropped_players, cur_streamers2, streamable_players)
			}

			for _, player := range parent2.Genes[i].NewPlayers {

				insert_child1(i, player, free_positions, &child1, week, child1_dropped_players, cur_streamers1, streamable_players)
			}
		}
	}

	// Add the total acquisitions to the children chromosomes
	get_total_acquisitions(&child1)
	get_total_acquisitions(&child2)

	// Mutate children
	// mutate(&child1, fas, free_positions, cur_streamers1, week)
	// mutate(&child2, fas, free_positions, cur_streamers2, week)

	return child1, child2
}

// Function to mutate a chromosome
func mutate(chromosome *Chromosome, fas []Player, free_positions map[int][]string, cur_streamers []Player, week string) {
	
	// Get random seed
	src := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(src)

	// Get random number to determine if mutation occurs
	rand_num := rng.Float64()

	if rand_num < 0.1 {

		// Drop a random player on a random day
		if rand_num < 0.033 {

			rand_day := rng.Intn(len(chromosome.Genes))
			new_players := []Player{}
			for _, player := range chromosome.Genes[rand_day].NewPlayers {
				new_players = append(new_players, player)
			}
			rand_index := rng.Intn(len(new_players))

			simple_delete_all_occurences(chromosome, new_players[rand_index], week, rand_day)

		} else if rand_num < 0.066 {
		// Add a random player in a random position on a random day

			for not_found := true; not_found; {

				rand_day := rng.Intn(len(chromosome.Genes))
				rand_index := rng.Intn(len(fas))
				fa := fas[rand_index]

				// Check if the player is already on the roster or if the player is not playing on the day
				if map_contains_value(chromosome.Genes[rand_day], fa.Name) != "" || !contains(schedule_map[week].Games[fa.Team], rand_day) {
					continue
				}
				not_found = false

				// Insert the player into the roster
				dummy_has_match := false
				matches := get_matches(fa.ValidPositions, free_positions[rand_day], &dummy_has_match)
				pos_map := drop_and_find_pos(fa, chromosome, matches, free_positions, rand_day, week, make(map[string]DroppedPlayer, 0), cur_streamers, make([]Player, len(fas)), false, true)
				cur_streamers[len(cur_streamers) - 1] = fa

				for day, pos := range pos_map {

					chromosome.Genes[day].Roster[pos] = fa
				}
			}

		} else {
		// Find a valid swap for a random player on a random day and swap them
			
		}
	}
}

// Function to delete all occurences of a player from a chromosome (simplified version)
func simple_delete_all_occurences(chromosome *Chromosome, player_to_drop Player, week string, start_day int) {

	for _, day := range schedule_map[week].Games[player_to_drop.Team] {

		// If the day is before the current day, skip it
		if day < start_day {
			continue
		}

		key := map_contains_value(chromosome.Genes[day], player_to_drop.Name)
		if key != "" {
			delete(chromosome.Genes[day].Roster, key)
		}
	}
}

// Function to insert a player into child1
func insert_child1(i int, player Player, free_positions map[int][]string, child1 *Chromosome, week string, child1_dropped_players map[string]DroppedPlayer, cur_streamers1 []Player, streamable_players []Player) {

	dummy_has_match := false
	matches := get_matches(player.ValidPositions, free_positions[i], &dummy_has_match)
	pos_map := drop_and_find_pos(player, child1, matches, free_positions, i, week, child1_dropped_players, cur_streamers1, make([]Player, len(streamable_players)), false, true)
	cur_streamers1[len(cur_streamers1) - 1] = player
	child1.Genes[i].NewPlayers[player.Name] = player
	child1.Genes[i].Acquisitions++

	for day, pos := range pos_map {
		child1.Genes[day].Roster[pos] = player
	}

}

// Function to insert a player into child2
func insert_child2(i int, player Player, free_positions map[int][]string, child2 *Chromosome, week string, child2_dropped_players map[string]DroppedPlayer, cur_streamers2 []Player, streamable_players []Player) {
	
	dummy_has_match := false
	matches := get_matches(player.ValidPositions, free_positions[i], &dummy_has_match)
	pos_map := drop_and_find_pos(player, child2, matches, free_positions, i, week, child2_dropped_players, cur_streamers2, make([]Player, len(streamable_players)), false, true)
	cur_streamers2[len(cur_streamers2) - 1] = player
	child2.Genes[i].NewPlayers[player.Name] = player
	child2.Genes[i].Acquisitions++

	for day, pos := range pos_map {
		child2.Genes[day].Roster[pos] = player
	}
}