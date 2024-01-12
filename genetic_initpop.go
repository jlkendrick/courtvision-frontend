package main

import (
	"fmt"
	"time"
	"sort"
	"math/rand"
)

// Function to create initial population
func create_initial_population(fas []Player, free_positions map[int][]string, week string, streamable_players []Player) []Chromosome {

	// Create random seed
	src := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(src)

	streamable_count := len(streamable_players)

	chromosomes := make([]Chromosome, 50)

	// Create 50 chromosomes
	for i := 0; i < 2; i++ {

		cur_streamers := make([]Player, 3)

		// Create chromosome
		days_in_week := schedule_map[week].GameSpan

		chromosome := Chromosome{Genes: make([]Gene, days_in_week+1), FitnessScore: 0, TotalAquisitions: 0, CumProbTracker: 0.0}

		// Initialize genes
		for j := 0; j <= days_in_week; j++ {
			chromosome.Genes[j] = Gene{Roster: make(map[string]Player), NewPlayers: make(map[string]Player), Day: j, Acquisitions: 0}
		}

		// Insert streamable players into chromosome
		insert_streamable_players(streamable_players, free_positions, week, &chromosome, cur_streamers)

		fmt.Println("Streamers:", cur_streamers)

		// Keep track of dropped players
		dropped_players := make(map[string]DroppedPlayer)

		// Create copy of free agents and free positions
		fas_copy := make([]Player, len(fas))
		copy(fas_copy, fas)

		free_positions_copy := make(map[int][]string)
		for k, v := range free_positions {
			free_positions_copy[k] = make([]string, len(v))
			copy(free_positions_copy[k], v)
		}

		// Fill the gene for each day
		for j := 0; j <= days_in_week; j++ {

			// Get gene for day
			gene := &chromosome.Genes[j]

			acq_count := rng.Intn(3 + rng.Intn(2))

			// Check if there are enough available positions to make acq_count moves
			if len(free_positions_copy[j]) < acq_count {
				acq_count = len(free_positions_copy[j])
			}

			// Check if there are enough droppable players to make acq_count moves
			if streamable_count < acq_count {
				acq_count = streamable_count
			}

			// On the first day, make it so you cant drop streamable players who are playing
			if j == 0 {
				acq_count = streamable_count - len(gene.Roster)
			}

			// Add acq_count players to gene
			for k := 0; k < acq_count; k++ {

				// Get random free agent that fits into free_positions
				trials := 0
				cont := true
				for cont && trials < 100 {

					// Get random free agent
					rand_index := rand.Intn(len(fas_copy))
					fa := fas_copy[rand_index]

					// Check if the free agent has a game on the day
					if !contains(schedule_map[week].Games[fa.Team], j) || fa.InjuryStatus == "OUT" {
						continue
					}

					// Get all the positions that the player fits in to
					has_match := false
					matches := get_matches(fa.ValidPositions, free_positions_copy[j], &has_match)

					if has_match {

						// Choose the positon that results in the highest "net rostering". Adjusted for choosing the best position for each day
						pos_map := drop_and_find_pos(fa, 
												   &chromosome, 
												   matches, 
												   free_positions_copy, 
												   j, 
												   week, 
												   dropped_players,
												   cur_streamers,
												   streamable_players,
												   j == 0,
												   true,
												   )

						// Remove position from free_positions_copy and player from free agents. Only remove from free pos on inital day so it doesn't interfere with same day moves
						fas_copy = remove(fas_copy, rand_index)

						// When added here, counts as a new player
						gene.NewPlayers[pos_map[j]] = fa
						gene.Acquisitions++
						cont = false

						// Fill other game days with added player because on other days, he can go on the bench
						for day, pos := range pos_map {

								// Add player to gene for that day. When added here, doesn't count as a new player
								chromosome.Genes[day].Roster[pos] = fa
						}

						// Once a player is added, add another player or go to next day
						cur_streamers[2] = fa
						break
					}
					trials++
				}
				trials = 0
			}
			// After each day, decrement countdown for dropped players
			for name, dp := range dropped_players {
				dp.Countdown--
				if dp.Countdown == 0 {
					delete(dropped_players, name)
					// Add player back to free agents
					fas_copy = append(fas_copy, dp.Player)
				} else {
					dropped_players[name] = dp
				}
			}
		}
		chromosomes[i] = chromosome
	}

	order := []string{"PG", "SG", "SF", "PF", "C", "G", "F", "UT1", "UT2", "UT3"}

	for i := 0; i < 2; i++ {
		total_acquisitions := 0
		for j := range chromosomes[i].Genes {
			fmt.Println()
			fmt.Println("Day", j)
			for _, pos := range order {
				fmt.Println(pos, chromosomes[i].Genes[j].Roster[pos].Name)
			}
			total_acquisitions += chromosomes[i].Genes[j].Acquisitions
		}
		fmt.Println(total_acquisitions)
	}
	return chromosomes
}

// Function to get all the positions that a free agent fits into
func get_matches(valid_positions []string, available_positions []string, has_match *bool) []string {

	var matches []string
	available_positions_map := make(map[string]bool)

	// Create map of available positions
	for _, pos := range available_positions {
		available_positions_map[pos] = true
	}

	// Loop through each valid position and see if it is in the available positions
	for _, valid_position := range valid_positions {

		if _, ok := available_positions_map[valid_position]; ok {
			*has_match = true
			matches = append(matches, valid_position)
		}
	}
	return matches
}


// Function to find the best position to put a player in
func drop_and_find_pos(player Player, 
					 chromosome *Chromosome, 
					 matches []string, 
					 free_positions map[int][]string, 
					 start_day int, 
					 week string, 
					 dropped_players map[string]DroppedPlayer, 
					 cur_streamers []Player,
					 streamable_players []Player,
					 first_day bool,
					 not_initial bool,
					 ) map[int]string {

	pos_map := make(map[int]string)

	if first_day {
		// If it is the first day, either put intial streamers in or adjust for other than initial streamers

		find_best_positions(player, chromosome, free_positions, pos_map, start_day, week)

		// After adding the initial streamers, when doing regular pickups on the first day, drop the streamer with the lowest average points
		if not_initial {

			// Delete the worst bench streamer
			sort.Slice(cur_streamers, func(i, j int) bool {
				return cur_streamers[i].AvgPoints < cur_streamers[j].AvgPoints 
			})

			index := 0
			for _, player := range cur_streamers {
				if !contains(player.ValidPositions, 0) {
					break
				}
				index++
			}
			// Drop the worst player from the chromosome
			delete_all_occurences(chromosome, cur_streamers, cur_streamers[index], week, start_day)
		}

	} else if len(chromosome.Genes[start_day].Roster) < len(streamable_players) {
		// If there are streamers on the bench, find best position for new player and drop the worst bench streamer

		not_playing_streamers := []Player{}

		// Get all the players that are not playing on the day
		for _, player := range cur_streamers {

			key := map_contains_value(chromosome.Genes[start_day], player.Name)
			if key == "" {
				not_playing_streamers = append(not_playing_streamers, player)
			}
		}

		// Get the worst player that is not playing on the day
		sort.Slice(not_playing_streamers, func(i, j int) bool {
			return not_playing_streamers[i].AvgPoints < not_playing_streamers[j].AvgPoints })
		worst_player := not_playing_streamers[0]

		// Drop the worst player from the chromosome
		delete_all_occurences(chromosome, cur_streamers, worst_player, week, start_day)
		dropped_players[worst_player.Name] = DroppedPlayer{Player: worst_player, Countdown: 3}

		// Choose the positon that results in the highest "net rostering". Adjusted for choosing the best position for each day
		find_best_positions(player, chromosome, free_positions, pos_map, start_day, week)

	} else {
		// If there are no streamers on the bench, drop a random playing streamer and find best position
		rand_index := rand.Intn(len(cur_streamers))
		random_streamer := cur_streamers[rand_index]
		delete_all_occurences(chromosome, cur_streamers, random_streamer, week, start_day)

		// Choose the positon that results in the highest "net rostering". Adjusted for choosing the best position for each day
		find_best_positions(player, chromosome, free_positions, pos_map, start_day, week)
	}
	
	return pos_map
}

// Function to check if a map contains a value and return the key
func map_contains_value(m Gene, value string) string {

	for k, v := range m.Roster {
		if v.Name == value {
			return k
		}
	}
	return ""
}

// Function to delete all occurences of a value in a chromosome
func delete_all_occurences(chromosome *Chromosome, cur_streamers []Player, player_to_drop Player, week string, start_day int) {

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

	// Remove player from added players
	cur_streamers_interface := make([]interface{}, len(cur_streamers))
	for i, v := range cur_streamers {
		cur_streamers_interface[i] = v
	}
	index := index_of(cur_streamers_interface, player_to_drop)
	cur_streamers = append(cur_streamers[:index], cur_streamers[index+1:]...)
}

// Function to insert initial streamable players into a chromosome
func insert_streamable_players(streamable_players []Player, free_positions map[int][]string, week string, chromosome *Chromosome, cur_streamers []Player) {

	// Insert streamable players into chromosome
	for index, player := range streamable_players {

		// Get all the positions that the player fits in to
		has_match := false
		first_game := schedule_map[week].Games[player.Team][0]
		matches := get_matches(player.ValidPositions, free_positions[first_game], &has_match)

		if has_match {

			// Choose the positon that results in the highest "net rostering". Adjusted for choosing the best position for each day
			pos_map := drop_and_find_pos(player, 
									   chromosome, 
									   matches, 
									   free_positions, 
									   first_game, 
									   week, 
									   make(map[string]DroppedPlayer), 
									   cur_streamers,
									   streamable_players,
									   true,
									   false,
									   )

			// Fill other game days with added player because on other days, he can go on the bench
			for day, pos := range pos_map {

					// Add player to gene for that day. When added here, doesn't count as a new player
					chromosome.Genes[day].Roster[pos] = player
			}
			chromosome.Genes[first_game].NewPlayers[pos_map[first_game]] = player
			cur_streamers[index] = player
		}
	}
}


// Function to find the best position for a player
func find_best_positions(player Player, chromosome *Chromosome, free_positions map[int][]string, pos_map map[int]string, start_day int, week string) {

	// Loop through each day and find the best position for each day
	for _, day := range schedule_map[week].Games[player.Team] {

		// If the day is before the current day, skip it
		if day < start_day {
			continue
		}

		has_match := false
		updated_matches := get_matches(player.ValidPositions, free_positions[day], &has_match)

		// If there are no matches, skip the day
		if !has_match {
			continue
		}

		// Go through matches in decreasing restriction order and assign the player to the first match that doesn't have a player in it
		for _, pos := range updated_matches {
			
			// If the position doesn't have a player in it, add to pos_map and break
			if _, ok := chromosome.Genes[day].Roster[pos]; !ok {
				pos_map[day] = pos
				break
			}
		}
	}
}