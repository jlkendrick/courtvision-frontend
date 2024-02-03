package tests

import (
	// "fmt"
	"fmt"
	. "main/functions"
	loaders "main/tests/resources"
	"math/rand"
	"testing"
	"time"
)

func TestInitPopIntegration(t *testing.T) {

	LoadSchedule("../static/schedule.json")

	roster_map := loaders.LoadRosterMap("resources/mock_roster.json")
	free_agents := loaders.LoadFreeAgents("resources/mock_freeagents.json")
	week := "15"
	threshold := 34.5
	size := 50
	population, _, _, _, _, _ := HelperInitPop(size, week, threshold, roster_map, free_agents)

	// Make sure that the initial population has (size) chromosomes
	if len(population) != size {
		t.Error("Initial population has incorrect size")
	}

}

func TestInsertStreamablePlayers(t *testing.T) {

	LoadSchedule("../static/schedule.json")

	roster_map := loaders.LoadRosterMap("resources/mock_roster.json")
	week := "11"
	threshold := 34.5

	new_optimal_lineup, streamable_players := OptimizeSlotting(roster_map, week, threshold)
	free_positions := GetUnusedPositions(new_optimal_lineup)

	streamable_count := len(streamable_players)
	cur_streamers := make([]Player, streamable_count)
	days_in_week := ScheduleMap[week].GameSpan

	// Make chromosome to compare against
	chromosome := Chromosome{Genes: make([]Gene, days_in_week+1), FitnessScore: 0, TotalAcquisitions: 0, CumProbTracker: 0.0, DroppedPlayers: make(map[string]DroppedPlayer)}

	// Initialize genes
	for i := 0; i <= days_in_week; i++ {
		chromosome.Genes[i] = Gene{Roster: make(map[string]Player), NewPlayers: make(map[string]Player), Day: i, Acquisitions: 0}
	}

	InsertStreamablePlayers(streamable_players, free_positions, week, &chromosome, cur_streamers)

	PrintPopulation(chromosome, free_positions)

	// Check to see if on day 0, the roster has all the streamable players who are playing and that they are in free positions
	for i := 0; i < 100; i++ {

		test_chromosome := Chromosome{Genes: make([]Gene, days_in_week+1), FitnessScore: 0, TotalAcquisitions: 0, CumProbTracker: 0.0, DroppedPlayers: make(map[string]DroppedPlayer)}

		// Initialize genes
		for j := 0; j <= days_in_week; j++ {
			test_chromosome.Genes[j] = Gene{Roster: make(map[string]Player), NewPlayers: make(map[string]Player), Day: j, Acquisitions: 0, DroppedPlayers: []Player{}, Bench: []Player{}}
		}

		InsertStreamablePlayers(streamable_players, free_positions, week, &test_chromosome, cur_streamers)

		for _, player := range streamable_players {
			if Contains(ScheduleMap[week].Games[player.Team], 0) {
				if MapContainsValue(test_chromosome.Genes[0].Roster, player.Name) == "" {
					t.Error("Initial streamer not in roster")
				}
				key := MapContainsValue(test_chromosome.Genes[0].Roster, player.Name)
				if !Contains(free_positions[0], key) {
					t.Error("Streamer in non-free position")
				}
			} else {
				// Make sure initial streamers who don't play on day 0 are on the bench
				if !Contains(test_chromosome.Genes[0].Bench, player) {
					t.Error("Streamer not on bench")
				}
			}
		}

		// Check to see if it is the same as the compare chromosome
		if !CompareChromosomes(chromosome, test_chromosome) {
			t.Error("Chromosomes not equal")
		}

		// Make sure for each day, the length of the roster plus the length of the bench is equal to the number of initial streamers
		for i := 0; i <= days_in_week; i++ {
			if len(test_chromosome.Genes[i].Roster) + len(test_chromosome.Genes[i].Bench) != streamable_count {
				t.Error("Roster and bench length not equal to streamable count")
			}
		}
	}
}

func TestCreateChromosome(t *testing.T) {

	LoadSchedule("../static/schedule.json")

	roster_map := loaders.LoadRosterMap("resources/mock_roster.json")
	free_agents := loaders.LoadFreeAgents("resources/mock_freeagents.json")
	week := "15"
	threshold := 34.5
	
	new_optimal_lineup, streamable_players := OptimizeSlotting(roster_map, week, threshold)
	free_positions := GetUnusedPositions(new_optimal_lineup)

	src := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(src)

	for i := 0; i < 101; i++ {

		chromosome := CreateChromosome(streamable_players, week, free_agents, free_positions, rng)

		for i, gene := range chromosome.Genes {
			// Check to see if every player in NewPlayers is in the roster
			for _, player := range gene.NewPlayers {
				if MapContainsValue(gene.Roster, player.Name) == "" {
					PrintPopulation(chromosome, free_positions)
					fmt.Println(player.Name, i)
					t.Error("NewPlayer not in roster")
				}
			}
			// Check to see if every player in DroppedPlayers is not in the roster
			for _, player := range gene.DroppedPlayers {
				if MapContainsValue(gene.Roster, player.Name) != "" {
					t.Error("DroppedPlayer in roster")
				}
			}
			// Make sure there are no duplicate players in the roster
			for key, value := range gene.Roster {
				if MapContainsValue(gene.Roster, value.Name) != key {
					t.Error("Duplicate player in roster")
				}
			}
		}

		// Check to see if the number of acquisitions is correct
		acquisitions := 0
		for _, gene := range chromosome.Genes {
			acquisitions += gene.Acquisitions
		}
		GetTotalAcquisitions(&chromosome)
		if acquisitions != chromosome.TotalAcquisitions {
			t.Error("TotalAcquisitions incorrect")
		}

		// Check to see if the number of streamers ever exceeds the streamable player count
		for _, gene := range chromosome.Genes {
			if len(gene.Roster) > len(streamable_players) {
				// fmt.Println(len(gene.Roster), len(streamable_players))
				// PrintPopulation(chromosome, free_positions)
				t.Error("Streamer count exceeds streamable player count")
			}
		}

		// Make sure that the number of players in the roster plus the number of players on the bench is equal to the number of streamable players
		for _, gene := range chromosome.Genes {
			if len(gene.Roster) + len(gene.Bench) != len(streamable_players) {
				PrintPopulation(chromosome, free_positions)
				t.Error("Roster and bench length not equal to streamable count")
			}
		}
	}

}
