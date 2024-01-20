package helper

import (
	"fmt"
	"sort"
	"math/rand"
	"time"
)

// Function to create initial population
func CreateInitialPopulation(size int, fas []Player, free_positions map[int][]string, week string, streamable_players []Player) []Chromosome {

	// Create random seed
	src := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(src)

	chromosomes := make([]Chromosome, size)

	// Create 50 chromosomes
	for i := 0; i < size; i++ {

		chromosome := CreateChromosome(streamable_players, week, fas, free_positions, rng)
		chromosomes[i] = chromosome
	}

	return chromosomes
}

func CreateChromosome(streamable_players []Player, week string, fas []Player, free_positions map[int][]string, rng *rand.Rand) Chromosome {

	cur_streamers := []Player{}
	streamable_count := len(streamable_players)
	days_in_week := ScheduleMap[week].GameSpan

	chromosome := Chromosome{Genes: make([]Gene, days_in_week+1), FitnessScore: 0, TotalAcquisitions: 0, CumProbTracker: 0.0, DroppedPlayers: make(map[string]DroppedPlayer)}

	// Initialize genes
	for j := 0; j <= days_in_week; j++ {
		chromosome.Genes[j] = Gene{Roster: make(map[string]Player), NewPlayers: make(map[string]Player), Day: j, Acquisitions: 0}
	}

	// Insert streamable players into chromosome
	InsertStreamablePlayers(streamable_players, free_positions, week, &chromosome, cur_streamers)

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
		if j == 0 && acq_count > len(free_positions_copy[j]) - len(gene.Roster) {
			acq_count = len(free_positions_copy[j]) - len(gene.Roster)
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
				if !Contains(ScheduleMap[week].Games[fa.Team], j) || fa.Injured {
					trials++
					continue
				}

				// Get all the positions that the player fits in to
				has_match := false
				matches := GetMatches(fa.ValidPositions, free_positions_copy[j], &has_match)

				if has_match {

					// Choose the positon that results in the highest "net rostering". Adjusted for choosing the best position for each day
					pos_map := GetPosMap(fa, 
										&chromosome, 
										matches, 
										free_positions_copy, 
										j, 
										week,
										cur_streamers,
										streamable_players,
										j == 0,
										true,
										)

					// Remove position from free_positions_copy and player from free agents. Only remove from free pos on inital day so it doesn't interfere with same day moves
					fas_copy = Remove(fas_copy, rand_index)
					
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
					cur_streamers = append(cur_streamers, fa)
					break
				}
				trials++
			}
			trials = 0
		}

		// After each day, decrement countdown for dropped players
		for name, player := range chromosome.DroppedPlayers {
			player.Countdown--
			if player.Countdown == 0 {
				delete(chromosome.DroppedPlayers, name)
				// Add player back to free agents
				fas_copy = append(fas_copy, player.Player)
			} else {
				chromosome.DroppedPlayers[name] = player
			}
		}
	}

	return chromosome
}


// Function to find the best position to put a player in
func GetPosMap(player Player, 
			  chromosome *Chromosome, 
			  matches []string, 
		      free_positions map[int][]string, 
			  start_day int, 
			  week string,
			  cur_streamers []Player,
			  streamable_players []Player,
			  first_day bool,
			  not_initial bool,
			  ) map[int]string {

	pos_map := make(map[int]string)

	if first_day {
	// If it is the first day, either put intial streamers in or adjust for other than initial streamers

		FindBestPositions(player, chromosome, free_positions, pos_map, start_day, week)

		// After adding the initial streamers, when doing regular pickups on the first day, drop the streamer with the lowest average points
		if not_initial {

			// Delete the worst bench streamer
			sort.Slice(cur_streamers, func(i, j int) bool {
			return cur_streamers[i].AvgPoints < cur_streamers[j].AvgPoints 
			})

			for _, dropped_player := range cur_streamers {
				if !Contains(ScheduleMap[week].Games[player.Team], 0) {
				// Drop the worst player from the chromosome
				DeleteAllOccurrences(chromosome, cur_streamers, dropped_player, week, start_day)
				chromosome.DroppedPlayers[dropped_player.Name] = DroppedPlayer{Player: dropped_player, Countdown: 3}
				}
			}
		}


	} else if len(chromosome.Genes[start_day].Roster) < len(streamable_players) {
	// If there are streamers on the bench, find best position for new player and drop the worst bench streamer

		not_playing_streamers := []Player{}

		// Get all the players that are not playing on the day
		for _, player := range cur_streamers {

			key := MapContainsValue(chromosome.Genes[start_day], player.Name)
			if key == "" {
				not_playing_streamers = append(not_playing_streamers, player)
			}
		}

		// Get the worst player that is not playing on the day
		sort.Slice(not_playing_streamers, func(i, j int) bool {
			return not_playing_streamers[i].AvgPoints < not_playing_streamers[j].AvgPoints })
		if len(not_playing_streamers) == 0 {
			fmt.Println(len(chromosome.Genes[start_day].Roster), len(streamable_players))
			fmt.Println(streamable_players)
		}
		worst_player := not_playing_streamers[0]

		// Drop the worst player from the chromosome
		DeleteAllOccurrences(chromosome, cur_streamers, worst_player, week, start_day)
		chromosome.DroppedPlayers[worst_player.Name] = DroppedPlayer{Player: worst_player, Countdown: 3}
		FindBestPositions(player, chromosome, free_positions, pos_map, start_day, week)

	} else {
	// If there are no streamers on the bench, drop a random playing streamer and find best position

		rand_index := rand.Intn(len(cur_streamers))
		random_streamer := cur_streamers[rand_index]

		DeleteAllOccurrences(chromosome, cur_streamers, random_streamer, week, start_day)
		chromosome.DroppedPlayers[random_streamer.Name] = DroppedPlayer{Player: random_streamer, Countdown: 3}
		FindBestPositions(player, chromosome, free_positions, pos_map, start_day, week)
	}

	return pos_map
}


// Function to insert initial streamable players into a chromosome
func InsertStreamablePlayers(streamable_players []Player, free_positions map[int][]string, week string, chromosome *Chromosome, cur_streamers []Player) {

	// Insert streamable players into chromosome
	for _, player := range streamable_players {

		// Get all the positions that the player fits in to
		has_match := false
		first_game := ScheduleMap[week].Games[player.Team][0]
		matches := GetMatches(player.ValidPositions, free_positions[first_game], &has_match)

		if has_match {

			// Choose the positon that results in the highest "net rostering". Adjusted for choosing the best position for each day
			pos_map := GetPosMap(player, 
								chromosome, 
								matches, 
								free_positions, 
								first_game, 
								week, 
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
			cur_streamers = append(cur_streamers, player)
		}
	}
}