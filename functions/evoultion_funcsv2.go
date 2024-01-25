package helper 

// Function to get the children of two parents
func Crossover(parent1 Chromosome, parent2 Chromosome, fas []Player, free_positions map[int][]string, streamable_players []Player, week string) (Chromosome, []Player, Chromosome, []Player, int) {

	// Get random seed
	src := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(src)

	// Create children
	child1 := Chromosome{Genes: make([]Gene, ScheduleMap[week].GameSpan + 1), FitnessScore: 0, TotalAcquisitions: 0, CumProbTracker: 0.0, DroppedPlayers: make(map[string]DroppedPlayer)}
	child2 := Chromosome{Genes: make([]Gene, ScheduleMap[week].GameSpan + 1), FitnessScore: 0, TotalAcquisitions: 0, CumProbTracker: 0.0, DroppedPlayers: make(map[string]DroppedPlayer)}

	// Initialize genes
	for j := 0; j <= ScheduleMap[week].GameSpan; j++ {
		child1.Genes[j] = Gene{Roster: make(map[string]Player), NewPlayers: make(map[string]Player), Day: j, Acquisitions: 0, DroppedPlayers: []Player{}}
		child2.Genes[j] = Gene{Roster: make(map[string]Player), NewPlayers: make(map[string]Player), Day: j, Acquisitions: 0, DroppedPlayers: []Player{}}
	}

	// Get random crossover point between one from the right and left
	crossover_point := rng.Intn(len(parent1.Genes) - 1) + 1
	
	// Fill genes with initial streamers
	cur_streamers1 := make([]Player, len(streamable_players))
	cur_streamers2 := make([]Player, len(streamable_players))
	InsertStreamablePlayers(streamable_players, free_positions, week, &child1, cur_streamers1)
	InsertStreamablePlayers(streamable_players, free_positions, week, &child2, cur_streamers2)

	for i := 0; i < len(parent1.Genes); i++ {

		fmt.Println(cur_streamers1)

		// If before crossover point, children are same as the respective parent
		if i < crossover_point {
			
			// Replicate the parent's roster
			for _, player := range parent1.Genes[i].NewPlayers {

				InsertPlayer(i, player, free_positions, &child1, week, cur_streamers1, streamable_players, false)
			}

			for _, player := range parent2.Genes[i].NewPlayers {
				
				InsertPlayer(i, player, free_positions, &child2, week, cur_streamers2, streamable_players, false)
			}

		} else {

			// Replicate the parent's roster but into the opposite child
			for _, player := range parent1.Genes[i].NewPlayers {

				// Check if the player is already on the child's roster or if he is still on the waiver wire
				valid := ValidatePlayer(&parent2, player)

				if valid {
					InsertPlayer(i, player, free_positions, &child2, week, cur_streamers2, streamable_players, false)
				} else {
					continue
				}
			}

			for _, player := range parent2.Genes[i].NewPlayers {

				// Check if the player is already on the child's roster or if he is still on the waiver wire
				valid := ValidatePlayer(&parent1, player)

				if valid {
					InsertPlayer(i, player, free_positions, &child1, week, cur_streamers1, streamable_players, false)
				} else {
					continue
				}
			}
		}

		// Decrement countdown for dropped players
		for player_name, dropped_player := range parent1.DroppedPlayers {
			if dropped_player.Countdown > 0 {
				dropped_player.Countdown--
				child1.DroppedPlayers[player_name] = dropped_player
			} else {
				delete(child1.DroppedPlayers, player_name)
			}
		}
		for player_name, dropped_player := range parent2.DroppedPlayers {
			if dropped_player.Countdown > 0 {
				dropped_player.Countdown--
				child2.DroppedPlayers[player_name] = dropped_player
			} else {
				delete(child2.DroppedPlayers, player_name)
			}
		}
	}

	return child1, cur_streamers1, child2, cur_streamers2, crossover_point
}

func InsertPlayer(limit int, day int, chromosome *Chromosome, player_to_add Player, free_positions map[int][]string) bool {

	// If the roster is full with n streamers, drop the worst streamer
	if CountPlayers(&chromosome) == limit {
		
		sort.Slice(cur_streamers, func(i, j int) bool {
			return cur_streamers[i].Score < cur_streamers[j].Score})
		worst_streamer := cur_streamers[0]

		// Make sure the new player can fit into the old player's position
		if !Contains(player_to_add.Positions, MapContainsValue(chromosome.Genes[day].Roster, worst_streamer.Name)) {
			return false
		}

		// If he can, drop the worst streamer
		index := IndexOfPlayer(cur_streamers, worst_streamer)
		cur_streamers[index] = player_to_add

		// Update future positions
		pos_map := FindFuturePositions(chromosome, free_positions)

	}
}

func CountPlayers(chromosome *Chromosome, day int) int {

	count := 0

	for _, player := range chromosome.Genes[day].Roster {
		if player.Name != "" {
			count += 1
		}
	}

	return count
}

func IndexOfPlayer(players []Player, player Player) int {

	for i, p := range players {
		if p.Name == player.Name {
			return i
		}
	}

	return -1
}

func FindFuturePositios(chromosome *Chromosome, free_positions map[int][]string) map[string]int {

	pos_map := make(map[string]int)

	

	return pos_map
}