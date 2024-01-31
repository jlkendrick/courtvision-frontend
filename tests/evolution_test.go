package tests

import (
	"fmt"
	. "main/functions"
	loaders "main/tests/resources"
	"math/rand"
	"testing"
	"sort"
	"time"
)

func TestEvolutionIntegration(t *testing.T) {

	LoadSchedule("../static/schedule.json")
	roster_map := loaders.LoadRosterMap()
	free_agents := loaders.LoadFreeAgents()
	optimal_lineup, streamable_players := OptimizeSlotting(roster_map, "15", 35.0)
	free_positions := GetUnusedPositions(optimal_lineup)
	week := "15"
	population := loaders.LoadInitPop()
	size := len(population)

	for i := 0; i < 1; i++ {

		// Score fitness of initial population and get total acquisitions
		for i := 0; i < len(population); i++ {
			GetTotalAcquisitions(&population[i])
			ScoreFitness(&population[i], week)
		}

		// Sort population by increasing fitness score
		sort.Slice(population, func(i, j int) bool {
			return population[i].FitnessScore < population[j].FitnessScore
		})

		population = EvolvePopulation(size, population, free_agents, free_positions, streamable_players, week)

		// Make sure there are not 2 of the same player in a genes roster
		for i := 0; i < ScheduleMap[week].GameSpan+1; i++ {
			for pos1, player1 := range population[len(population)-1].Genes[i].Roster {
				for pos2, player2 := range population[len(population)-1].Genes[i].Roster {
					if pos1 != pos2 && player1.Name == player2.Name {
						t.Error("Duplicate player in child1")
					}
				}
			}
		}

		// Make sure the number of streamers never exceeds the number of streamable players
		for _, chromosome := range population {
			for _, gene := range chromosome.Genes {
				if len(gene.Roster) > len(streamable_players) {
					t.Error("Streamer count exceeds streamable player count")
				}
			}
		}
	}

	// Make sure that the initial population has (size) chromosomes
	if len(population) != size {
		t.Error("Initial population has incorrect size")
	}
}

func TestCrossover(t *testing.T) {

	LoadSchedule("../static/schedule.json")

	src := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(src)

	free_agents := loaders.LoadFreeAgents()
	roster_map := loaders.LoadRosterMap()
	week := "15"

	optimal_lineup, streamable_players := OptimizeSlotting(roster_map, week, 34.5 )
	free_positions := GetUnusedPositions(optimal_lineup)

	population := loaders.LoadInitPop()
	size := len(population)

	// Test crossover
	fmt.Println(streamable_players)

	// Check 100 sets of children
	for i := 0; i < 100; i++ {

		parent1 := population[rng.Intn(size)]
		parent2 := population[rng.Intn(size)]

		child, _ := Crossover(parent1, parent2, free_agents, free_positions, streamable_players, week)

		// Make sure playing streamable players are rostered on the first day and in the same position in as the parent
		for _, player := range streamable_players {
			if Contains(ScheduleMap[week].Games[player.Team], 0) {
				pos := MapContainsValue(child.Genes[0].Roster, player.Name)
				if pos == "" || pos != MapContainsValue(parent1.Genes[0].Roster, player.Name) {
					fmt.Println(pos, MapContainsValue(parent1.Genes[0].Roster, player.Name), player.Name)
					t.Error("Streamer not in child or not in same position as parent1")
				}
			}
		}

		// Make sure there are not 2 of the same player in a genes roster
		for i := 0; i < ScheduleMap[week].GameSpan+1; i++ {
			for pos1, player1 := range child.Genes[i].Roster {
				for pos2, player2 := range child.Genes[i].Roster {
					if pos1 != pos2 && player1.Name == player2.Name {
						PrintPopulation(child, free_positions)
						t.Error("Duplicate player in child1")
					}
				}
			}
		}

		// Make sure the sum of the roster and bench is equal to the number of streamable players
		for i := 0; i < ScheduleMap[week].GameSpan+1; i++ {
			if len(child.Genes[i].Roster) + len(child.Genes[i].Bench) != len(streamable_players) {
				PrintPopulation(child, free_positions)
				t.Error("Roster and bench length not equal to streamable count")
			}
		}

		// Make sure each NewPlayer in the child is in one of the parents' NewPlayers
		for i := 0; i < ScheduleMap[week].GameSpan+1; i++ {
			for _, player := range child.Genes[i].NewPlayers {
				if MapContainsValue(parent1.Genes[i].NewPlayers, player.Name) == "" && MapContainsValue(parent2.Genes[i].NewPlayers, player.Name) == "" {
					t.Error("NewPlayer not in parent1 or parent2")
				}
			}
		}

		GetTotalAcquisitions(&child)

		// Make sure total acquisitions are correct
		child1_acquisitions := 0
		for i := 0; i < ScheduleMap[week].GameSpan+1; i++ {
			child1_acquisitions += len(child.Genes[i].NewPlayers)
		}
		if child1_acquisitions != child.TotalAcquisitions {
			fmt.Println(child1_acquisitions, child.TotalAcquisitions)
			PrintPopulation(child, free_positions)
			t.Error("Incorrect child1 acquisitions")
		}

	}

}

func TestMutationDrop(t *testing.T) {

	LoadSchedule("../static/schedule.json")

	// Get chromosomes for testing
	free_agents := loaders.LoadFreeAgents()
	roster_map := loaders.LoadRosterMap()
	week := "15"

	optimal_lineup, streamable_players := OptimizeSlotting(roster_map, week, 34.5)
	free_positions := GetUnusedPositions(optimal_lineup)

	population := loaders.LoadInitPop()

	// Test mutate drop
	for i := 0; i < 100; i++ {

		parent1 := SelectFirstParent(population)
		parent2 := SelectSecondParent(population)

		chromosome, cur_streamers := Crossover(parent1, parent2, free_agents, free_positions, streamable_players, week)
		GetTotalAcquisitions(&chromosome)
		pre_aquisitions := chromosome.TotalAcquisitions

		// Test mutate clone drop
		var changed_player Player
		var dummy_changed_player Player
		var dummy_swap_success bool
		var drop_day int
		var dummy_add_success bool
		MutateForTest(true, false, false, &drop_day, &dummy_swap_success, &dummy_add_success, &changed_player, &dummy_changed_player, &chromosome, free_agents, free_positions, cur_streamers, week, streamable_players)

		// Make sure the dropped player is not in the roster after the drop
		for i, gene := range chromosome.Genes {
			if i < drop_day {
				continue
			}
			if MapContainsValue(gene.Roster, changed_player.Name) != "" {
				PrintPopulation(chromosome, free_positions)
				fmt.Println(changed_player.Name, drop_day, i)
				fmt.Println(chromosome.Genes[i].NewPlayers)
				t.Error("Dropped player is in roster")
			}
		}

		// Make sure the TotalAcquisitions dropped by 1
		if chromosome.TotalAcquisitions != pre_aquisitions-1 {
			fmt.Println(chromosome.TotalAcquisitions, pre_aquisitions)
			t.Error("TotalAcquisitions did not decrease by 1")
		}
	}
	
}

func TestMutationAdd(t *testing.T) {

	LoadSchedule("../static/schedule.json")

	// Get chromosomes for testing
	free_agents := loaders.LoadFreeAgents()
	roster_map := loaders.LoadRosterMap()
	week := "15"

	optimal_lineup, streamable_players := OptimizeSlotting(roster_map, week, 34.5)
	free_positions := GetUnusedPositions(optimal_lineup)

	population := loaders.LoadInitPop()

	// Test mutate add
	for i := 0; i < 100; i++ {

		parent1 := SelectFirstParent(population)
		parent2 := SelectSecondParent(population)

		chromosome, cur_streamers1 := Crossover(parent1, parent2, free_agents, free_positions, streamable_players, week)
		GetTotalAcquisitions(&chromosome)
		pre_aquisitions := chromosome.TotalAcquisitions

		// Make sure the number of streamers never exceeds the number of streamable players
		for _, chromosome := range population {
			for _, gene := range chromosome.Genes {
				if len(gene.Roster) > len(streamable_players) {
					t.Error("Streamer count exceeds streamable player count before add")
				}
			}
		}

		var changed_player Player
		var dummy_changed_player Player
		var dummy_swap_success bool
		var dummy_drop_day int
		var add_success bool = true
		MutateForTest(false, true, false, &dummy_drop_day, &dummy_swap_success, &add_success, &changed_player, &dummy_changed_player, &chromosome, free_agents, free_positions, cur_streamers1, week, streamable_players)

		if !add_success {
			fmt.Println("No player was added")
			continue
		}
		// Make sure the added player is in the roster
		if changed_player.Name != "" {
			found := false
			for _, gene := range chromosome.Genes {
				if MapContainsValue(gene.Roster, changed_player.Name) != "" {
					found = true
					break
				}
			}
			if !found {
				t.Error("Added player is not in roster")
			}
		} else {
			t.Error("No player was added")
		}

		// Make sure the TotalAcquisitions increased by 1
		if chromosome.TotalAcquisitions != pre_aquisitions+1 {
			fmt.Println(chromosome.TotalAcquisitions, pre_aquisitions)
			t.Error("TotalAcquisitions did not increase by 1")
		}

		// Make sure there are not 2 of the same player in a genes roster
		for i := 0; i < ScheduleMap[week].GameSpan+1; i++ {
			for pos1, player1 := range chromosome.Genes[i].Roster {
				for pos2, player2 := range chromosome.Genes[i].Roster {
					if pos1 != pos2 && player1.Name == player2.Name {
						PrintPopulation(chromosome, free_positions)
						t.Error("Duplicate player in child1")
					}
				}
			}
		}

	}

}

func TestMutationSwap(t *testing.T) {

	LoadSchedule("../static/schedule.json")

	// Get chromosomes for testing
	free_agents := loaders.LoadFreeAgents()
	roster_map := loaders.LoadRosterMap()
	week := "15"

	optimal_lineup, streamable_players := OptimizeSlotting(roster_map, week, 34.5)
	free_positions := GetUnusedPositions(optimal_lineup)

	population := loaders.LoadInitPop()

	// Test mutate swap
	for i := 0; i < 100; i++ {

		parent1 := SelectFirstParent(population)
		parent2 := SelectSecondParent(population)

		chromosome, cur_streamers1 := Crossover(parent1, parent2, free_agents, free_positions, streamable_players, week)

		var changed_player1 Player
		var changed_player2 Player

		// PrintPopulation(chromosome, free_positions)
		swap_success := false
		var dummy_drop_day int
		var dummy_add_success bool
		MutateForTest(false, false, true, &dummy_drop_day, &swap_success, &dummy_add_success, &changed_player1, &changed_player2, &chromosome, free_agents, free_positions, cur_streamers1, week, streamable_players)
		// fmt.Println(changed_player1, changed_player2)
		// PrintPopulation(chromosome, free_positions)

		if swap_success {
			// Make sure the swapped players are in the roster
			if changed_player1.Name != "" && changed_player2.Name != "" {
				found1 := false
				found2 := false
				for _, gene := range chromosome.Genes {
					if MapContainsValue(gene.Roster, changed_player1.Name) != "" {
						found1 = true
					}
					if MapContainsValue(gene.Roster, changed_player2.Name) != "" {
						found2 = true
					}
				}
				if !found1 {
					fmt.Println(changed_player1.Name, changed_player2.Name)
					t.Error("Swapped player1 is not in roster")
				}
				if !found2 {
					t.Error("Swapped player2 is not in roster")
				}
			}
		}

		// Make sure there are not 2 of the same player in a genes roster
		for i := 0; i < ScheduleMap[week].GameSpan+1; i++ {
			for pos1, player1 := range chromosome.Genes[i].Roster {
				for pos2, player2 := range chromosome.Genes[i].Roster {
					if pos1 != pos2 && player1.Name == player2.Name {
						t.Error("Duplicate player in child1")
					}
				}
			}
		}
	}
	
}

func MutateForTest(drop bool, add bool, swap bool, drop_day *int, swap_success *bool, add_success *bool, changed_player1 *Player, changed_player2 *Player, chromosome *Chromosome, fas []Player, free_positions map[int][]string, cur_streamers []Player, week string, streamable_players []Player) {

	// Get random seed
	src := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(src)

	if drop {
		// Drop a random player on a random day
		DropForTest(rng, chromosome, drop_day, changed_player1, week)

	} else if add {
		// Add a random player in a random position on a random day
		AddForTest(rng, add_success, free_positions, chromosome, fas, changed_player1, week, cur_streamers, streamable_players)

	} else {
		// Find a valid swap for a random player on a random day and swap them
		SwapForTest(chromosome, free_positions, cur_streamers, streamable_players, swap_success, changed_player1, changed_player2, week)

	}
}


// Function to drop a random player on a random day
func DropForTest(rng *rand.Rand, chromosome *Chromosome, drop_day *int, changed_player1 *Player, week string) {

	// Until a day with a new player is found, keep generating random days
	for not_found := true; not_found; {
		// Until a day with a new player is found, keep generating random days
		day := 0
		test_day := rng.Intn(len(chromosome.Genes))
		for day == 0 {

			if len(chromosome.Genes[test_day].NewPlayers) > 0 {
				day = test_day
				break
			} else {
				test_day = rng.Intn(len(chromosome.Genes))
			}
		}

		// Turn the map of new players into a slice
		new_players := make([]Player, len(chromosome.Genes[day].NewPlayers))
		for _, player := range chromosome.Genes[day].NewPlayers {
			new_players = append(new_players, player)
		}
		rand_index := rng.Intn(len(new_players))
		player_to_drop := new_players[rand_index]

		// Check if the player is ever re-added in the future, if he is, get a new player
		for i := day; i < len(chromosome.Genes); i++ {
			if MapContainsValue(chromosome.Genes[i].Roster, player_to_drop.Name) != "" {
				continue
			}
		}
		not_found = false

		// Delete the player from the roster and decrement the acquisitions
		chromosome.Genes[day].Acquisitions -= 1
		chromosome.TotalAcquisitions -= 1
		SimpleDeleteAllOccurences(chromosome, new_players[rand_index], week, day)
	}
}

// Function to add a random player in a random position on a random day
func AddForTest(rng *rand.Rand, add_success *bool, free_positions map[int][]string, chromosome *Chromosome, fas []Player, changed_player1 *Player, week string, cur_streamers []Player, streamable_players []Player) {

	// Functon to check if a player can be rostered on a day
	CheckPos := func (fa Player, rand_day int) bool {

		// Make sure the player is not already on the roster or if he is that he was dropped two or more days ago
		for i := rand_day; i < len(chromosome.Genes); i++ {
			if MapContainsValue(chromosome.Genes[i].Roster, fa.Name) != "" {
				return false
			}
		}
		for i := 0; i < rand_day; i++ {
			if MapContainsValue(chromosome.Genes[i].Roster, fa.Name) != "" {
				if rand_day - i < 2 {
					return false
				}
			}
		}
		// Check if the player can be rostered on the day
		for _, pos := range fa.ValidPositions {
			if Contains(free_positions[rand_day], pos) {
				if _, ok := chromosome.Genes[rand_day].Roster[pos]; !ok {
					return true
				}
			}
		}
		return false
	}

	// Until a valid player is found, keep generating random players and days
	trials := 0
	for not_found := true; not_found && trials < 100; {

		// Generate a random day and player
		rand_day := rng.Intn(len(chromosome.Genes))
		rand_index := rng.Intn(len(fas))
		fa := fas[rand_index]

		// Check if the player is already on the roster or if the player is not playing on the day
		if MapContainsValue(chromosome.Genes[rand_day].Roster, fa.Name) != "" || !Contains(ScheduleMap[week].Games[fa.Team], rand_day) || fa.Injured || !CheckPos(fa, rand_day) {
			trials += 1
			continue
		}

		// Insert the player into the roster
		// dummy_has_match := false
		add := false
		// fmt.Println("original chromosome")
		// fmt.Println("palyer to add", fa.Name)
		// fmt.Println("day", rand_day)
		// PrintPopulation(*chromosome, free_positions)
		// matches := GetMatches(fa.ValidPositions, free_positions[rand_day], &dummy_has_match)
		pos_map := GetPosMap(fa, chromosome, free_positions, rand_day, week, cur_streamers, streamable_players, false, true, &add, true)

		*changed_player1 = fa

		for day, pos := range pos_map {
			not_found = false

			chromosome.Genes[day].Roster[pos] = fa
		}

		if !not_found {
			chromosome.Genes[rand_day].NewPlayers[fa.Name] = fa
			chromosome.Genes[rand_day].Acquisitions += 1
			chromosome.TotalAcquisitions += 1
		}
	}
	if trials >= 100 {
		*add_success = false
	}
}

// Function to find a valid swap for a random player on a random day and swap them
func SwapForTest(chromosome *Chromosome, free_positions map[int][]string, cur_streamers []Player, streamable_players []Player, swap_success *bool, changed_player1 *Player, changed_player2 *Player, week string) {

	player1, day1, player2, day2 := FindValidSwap(chromosome, free_positions, cur_streamers, week)

	*changed_player1 = player1
	*changed_player2 = player2

	// Delete player1 from day1
	SimpleDeleteAllOccurences(chromosome, player1, week, day1)
	// Delete player2 from day2
	SimpleDeleteAllOccurences(chromosome, player2, week, day2)

	if player1.Name != "" && player2.Name != "" {

		InsertPlayer(day2, player1, free_positions, chromosome, week, cur_streamers, streamable_players, true)
		InsertPlayer(day1, player2, free_positions, chromosome, week, cur_streamers, streamable_players, true)
		*swap_success = true
	} else {
		fmt.Println("No valid swap found")
	}
}