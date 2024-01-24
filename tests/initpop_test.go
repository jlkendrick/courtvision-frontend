package tests

import (
	"main/tests/resources"
	. "main/functions"
	"math/rand"
	"testing"
	"time"
)

func TestInitPopIntegration(t *testing.T) {

	LoadSchedule("../static/schedule.json")

	size := 50
	population, _, _, _, _, _ := HelperInitPop(size)

	// Make sure that the initial population has (size) chromosomes
	if len(population) != size {
		t.Error("Initial population has incorrect size")
	}

}

func TestInsertStreamablePlayers(t *testing.T) {

	LoadSchedule("../static/schedule.json")

	roster_map := loaders.LoadRosterMap()
	week := "13"
	threshold := 35.0

	new_optimal_lineup, streamable_players := OptimizeSlotting(roster_map, week, threshold)
	free_positions := GetUnusedPositions(new_optimal_lineup)

	streamable_count := len(streamable_players)
	cur_streamers := make([]Player, streamable_count)
	days_in_week := ScheduleMap[week].GameSpan

	// Check to see if on day 0, the roster has all the streamable players who are playing and that they are in free positions
	for i := 0; i < 5; i++ {

		chromosome := Chromosome{Genes: make([]Gene, days_in_week+1), FitnessScore: 0, TotalAcquisitions: 0, CumProbTracker: 0.0, DroppedPlayers: make(map[string]DroppedPlayer)}

		// Initialize genes
		for j := 0; j <= days_in_week; j++ {
			chromosome.Genes[j] = Gene{Roster: make(map[string]Player), NewPlayers: make(map[string]Player), Day: j, Acquisitions: 0}
		}

		InsertStreamablePlayers(streamable_players, free_positions, week, &chromosome, cur_streamers)

		for _, player := range streamable_players {
			if Contains(ScheduleMap[week].Games[player.Team], 0) {
				if MapContainsValue(chromosome.Genes[0], player.Name) == "" {
					t.Error("Initial streamer not in roster")
				}
				key := MapContainsValue(chromosome.Genes[0], player.Name)
				if !Contains(free_positions[0], key) {
					t.Error("Streamer in non-free position")
				}
			}
		}
	}
}

func TestCreateChromosome(t *testing.T) {

	LoadSchedule("../static/schedule.json")

	roster_map := loaders.LoadRosterMap()
	free_agents := loaders.LoadFreeAgents()
	week := "13"
	threshold := 35.0
	
	new_optimal_lineup, streamable_players := OptimizeSlotting(roster_map, week, threshold)
	free_positions := GetUnusedPositions(new_optimal_lineup)

	src := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(src)

	for i := 0; i < 100; i++ {

		chromosome := CreateChromosome(streamable_players, week, free_agents, free_positions, rng)

		for _, gene := range chromosome.Genes {
			// Check to see if every player in NewPlayers is in the roster
			for _, player := range gene.NewPlayers {
				if MapContainsValue(gene, player.Name) == "" {
					t.Error("NewPlayer not in roster")
				}
			}
			// Check to see if every player in DroppedPlayers is not in the roster
			for _, player := range gene.DroppedPlayers {
				if MapContainsValue(gene, player.Name) != "" {
					t.Error("DroppedPlayer in roster")
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
	}

}
