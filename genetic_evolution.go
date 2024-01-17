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

	// // Implement elitism
	
	next_generation[48] = population[48]
	next_generation[49] = population[49]
	
	for i := 0; i < 24; i++ {
		
		// Get parents
		parent1 := select_first_parent(population)
		parent2 := select_second_parent(population)


		// Get children
		child1, child2 := get_children(parent1, parent2, fas, free_positions, streamable_players, week)

		// Add children to evolved population
		next_generation[i*2] = child1
		next_generation[i*2+1] = child2
		
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

	return tournament[rng.Intn(3)][0]
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

				insert_player(i, player, free_positions, &child1, week, child1_dropped_players, cur_streamers1, streamable_players)
			}

			for _, player := range parent2.Genes[i].NewPlayers {
				
				insert_player(i, player, free_positions, &child2, week, child2_dropped_players, cur_streamers2, streamable_players)
			}

		} else {

			// Replicate the parent's roster but into the opposite child
			for _, player := range parent1.Genes[i].NewPlayers {

				// Check if the player is already on the child's roster or if he is still on the waiver wire
				valid := validate_player(player, parent2.Genes, child2_dropped_players)

				if valid {
					insert_player(i, player, free_positions, &child2, week, child2_dropped_players, cur_streamers2, streamable_players)
				} else {
					continue
				}
			}

			for _, player := range parent2.Genes[i].NewPlayers {

				// Check if the player is already on the child's roster or if he is still on the waiver wire
				valid := validate_player(player, parent1.Genes, child1_dropped_players)

				if valid {
					insert_player(i, player, free_positions, &child1, week, child1_dropped_players, cur_streamers1, streamable_players)
				} else {
					continue
				}
			}
		}
	}

	// Add the total acquisitions to the children chromosomes
	get_total_acquisitions(&child1)
	get_total_acquisitions(&child2)

	// Mutate children
	mutate(&child1, child1_dropped_players, fas, free_positions, cur_streamers1, week, streamable_players)
	mutate(&child2, child2_dropped_players, fas, free_positions, cur_streamers2, week, streamable_players)

	return child1, child2
}

// Function to mutate a chromosome
func mutate(chromosome *Chromosome, dropped_players map[string]DroppedPlayer, fas []Player, free_positions map[int][]string, cur_streamers []Player, week string, streamable_players []Player) {
	
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
			if len(new_players) == 0 {
				return
			}
			rand_index := rng.Intn(len(new_players))

			simple_delete_all_occurences(chromosome, new_players[rand_index], week, rand_day)

		} else if rand_num < 0.66{
		// Add a random player in a random position on a random day

			for not_found := true; not_found; {

				rand_day := rng.Intn(len(chromosome.Genes))
				rand_index := rng.Intn(len(fas))
				fa := fas[rand_index]

				// Check if the player is already on the roster or if the player is not playing on the day
				if map_contains_value(chromosome.Genes[rand_day], fa.Name) != "" || !contains(schedule_map[week].Games[fa.Team], rand_day) || fa.InjuryStatus == "OUT" {
					continue
				}
				not_found = false

				// Insert the player into the roster
				dummy_has_match := false
				matches := get_matches(fa.ValidPositions, free_positions[rand_day], &dummy_has_match)
				pos_map := drop_and_find_pos(fa, chromosome, matches, free_positions, rand_day, week, make(map[string]DroppedPlayer, 0), cur_streamers, streamable_players, false, true)
				cur_streamers[len(cur_streamers) - 1] = fa

				for day, pos := range pos_map {

					chromosome.Genes[day].Roster[pos] = fa
				}
			}

		} else {
		// Find a valid swap for a random player on a random day and swap them
			player1, day1, player2, day2 := find_valid_swap(chromosome, free_positions, cur_streamers, week)

			if player1.Name != "" && player2.Name != "" {
				
				insert_player(day1, player2, free_positions, chromosome, week, dropped_players, cur_streamers, streamable_players)
				insert_player(day2, player1, free_positions, chromosome, week, dropped_players, cur_streamers, streamable_players)
			}
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

// Function to insert a player into a chromosome
func insert_player(day int, player Player, free_positions map[int][]string, child *Chromosome, week string, dropped_players map[string]DroppedPlayer, cur_streamers []Player, streamable_players []Player) {

	dummy_has_match := false
	matches := get_matches(player.ValidPositions, free_positions[day], &dummy_has_match)
	pos_map := drop_and_find_pos(player, child, matches, free_positions, day, week, dropped_players, cur_streamers, make([]Player, len(streamable_players)), false, true)
	cur_streamers[len(cur_streamers) - 1] = player
	child.Genes[day].NewPlayers[player.Name] = player
	child.Genes[day].Acquisitions++

	for day, pos := range pos_map {
		child.Genes[day].Roster[pos] = player
	}
}

// Function to validate the insertion of a player into a chromosome
func validate_player(player Player, roster []Gene, dropped_players map[string]DroppedPlayer) bool {

	// Function to see if the player is in the dropped players map
	check_dropped_players := func(dropped_players map[string]DroppedPlayer, player_name string) bool {
		if _, ok := dropped_players[player_name]; ok {
			return true
		}
		return false
	}

	// Check if the player is already on the roster or if he is still on the waiver wire
	for _, gene := range roster {
		if map_contains_value(gene, player.Name) != "" || check_dropped_players(dropped_players, player.Name) {
			return false
		}
	}

	return true
}

// Function to find a valid swap for a chromosome mutation
func find_valid_swap(chromosome *Chromosome, free_positions map[int][]string, streamable_players []Player, week string) (Player, int, Player, int) {

	// Get random seed
	src := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(src)

	check := func(day1 int, day2 int, player1 Player, player2 Player) bool {

		// Check if the players are playing on the days
		if (!contains(schedule_map[week].Games[player1.Team], day1)) || (!contains(schedule_map[week].Games[player2.Team], day2)) {
			return false

		}

		// Check if the player can be rostered on the day
		free_positions_on_day1_map := make(map[string]bool)
		free_positions_on_day2_map := make(map[string]bool)
		
		for _, pos := range free_positions[day1] {
			free_positions_on_day1_map[pos] = true
		}
		for _, pos := range free_positions[day2] {
			free_positions_on_day2_map[pos] = true
		}

		// Remove the positions that are already filled
		for pos, player1 := range chromosome.Genes[day1].Roster {
			if _, ok := free_positions_on_day1_map[pos]; ok && chromosome.Genes[day1].Roster[pos].Name != player1.Name {
				delete(free_positions_on_day1_map, pos)
			}
		}
		for pos, player2 := range chromosome.Genes[day2].Roster {
			if _, ok := free_positions_on_day2_map[pos]; ok && chromosome.Genes[day2].Roster[pos].Name != player2.Name {
				delete(free_positions_on_day2_map, pos)
			}
		}

		// Check if the players can be rostered on the days
		for _, pos := range player1.ValidPositions {
			if _, ok := free_positions_on_day2_map[pos]; ok {
				return true
			}
		}
		for _, pos := range player2.ValidPositions {
			if _, ok := free_positions_on_day1_map[pos]; ok {
				return true
			}
		}

		return false
	}

	for trials := 0; trials < 100; trials++ {
		// Get two random days that are not the same
		rand_day1 := rng.Intn(len(chromosome.Genes))
		rand_day2 := rng.Intn(len(chromosome.Genes))
		for rand_day1 == rand_day2 {
			rand_day2 = rng.Intn(len(chromosome.Genes))
		}

		for not_found_swap := true; not_found_swap; {

			// Get two random players that were added on that day
			if len(chromosome.Genes[rand_day1].NewPlayers) == 0 || len(chromosome.Genes[rand_day2].NewPlayers) == 0 {
				break
			}
			rand_index1 := rng.Intn(len(chromosome.Genes[rand_day1].NewPlayers))
			rand_index2 := rng.Intn(len(chromosome.Genes[rand_day2].NewPlayers))
			map_keys1 := make([]string, 0, len(chromosome.Genes[rand_day1].NewPlayers))
			for key := range chromosome.Genes[rand_day1].NewPlayers {
				map_keys1 = append(map_keys1, key)
			}
			map_keys2 := make([]string, 0, len(chromosome.Genes[rand_day2].NewPlayers))
			for key := range chromosome.Genes[rand_day2].NewPlayers {
				map_keys2 = append(map_keys2, key)
			}
			player1 := chromosome.Genes[rand_day1].NewPlayers[map_keys1[rand_index1]]
			player2 := chromosome.Genes[rand_day2].NewPlayers[map_keys2[rand_index2]]

			if check(rand_day1, rand_day2, player1, player2) {
				return player1, rand_day1, player2, rand_day2

			} else {
				continue

			}
		}
	}
	return Player{}, 0, Player{}, 0
}