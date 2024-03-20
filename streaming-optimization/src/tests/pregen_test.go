package tests

import (
	"fmt"
	. "main/functions"
	loaders "main/tests/resources"
	"testing"
)

func TestLoadSchedule(t *testing.T) {
	
	LoadSchedule("../static/schedule.json")

	// Check to see if ScheduleMap is empty
	if len(ScheduleMap) == 0 {
		t.Error("ScheduleMap is empty")
	}

	free_agents := loaders.LoadFreeAgents("resources/mock_freeagents.json")

	// Check to see if every team has a schedule
	for _, player := range free_agents {
		if player.Team == "FA" {
			continue
		}
		if _, ok := ScheduleMap["13"].Games[player.Team]; !ok {
			t.Error("ScheduleMap missing team:", player.Team)
		}
	}

}

func TestAPI(t *testing.T) {
	
	// Retrieve team and free agent data from API
	espn_s2 := ""
	swid := ""
	league_id := 424233486
	team_name := "James's Scary Team"
	year := 2024
	fa_count := 150
	roster_map, free_agents := GetPlayers(league_id, espn_s2, swid, team_name, year, fa_count)

	// Check if roster_map is empty
	if len(roster_map) == 0 {
		t.Error("Roster map is empty")
	}

	// Check if free_agents is empty
	if len(free_agents) == 0 {
		t.Error("Free agents is empty")
	}

	// Check if roster_map contains players
	for _, player := range roster_map {
		if player.Name == "" || 
		   player.Team == "" || 
		   len(player.ValidPositions) == 0 || 
		   player.AvgPoints == 0 {
			t.Error("Roster map contains empty player")
		}
	}

	// Check if free_agents contains players
	for _, player := range free_agents {
		if player.Name == "" || 
		   player.Team == "" || 
		   len(player.ValidPositions) == 0 {
			t.Error("Free agents contains empty player")
		}
	}

	// Check if roster_map is empty
	if len(roster_map) == 0 {
		t.Error("Roster map is empty")
	}

	// Check if free_agents is empty
	if len(free_agents) == 0 {
		t.Error("Free agents is empty")
	}

}

func TestOptimizeSlotting(t *testing.T) {

	LoadSchedule("../static/schedule.json")

	roster_map := loaders.LoadRosterMap("resources/mock_roster.json")

	week := "10"
	threshold := 31.0

	// Optimize slotting and get streamable players
	optimal_lineup, _ := OptimizeSlotting(roster_map, week, threshold)

	// Check to see if there are the correct number of days in the optimal_lineup
	if len(optimal_lineup) != ScheduleMap[week].GameSpan + 1 {
		t.Error("Incorrect number of days in optimal_lineup")
	}

	// Check to see if there are any injured players in the optimal_lineup
	for _, roster := range optimal_lineup {
		for _, player := range roster {
			if player.Injured == true {
				t.Error("Injured player in optimal_lineup")
			}
		}
	}

	// Check to see if there are the correct number of players in the optimal_lineup
	for day, roster := range optimal_lineup {

		rostered_count := 0
		for _, player := range roster {
			if player.Name != "" {
				rostered_count += 1
			}
		}

		correct_num_players := 0
		for pos, player := range roster {
			if Contains(ScheduleMap[week].Games[player.Team], day) && player.AvgPoints > threshold {
				correct_num_players += 1
				if pos == "IR" {
					t.Error("IR player in optimal_lineup")
				}
			}
		}

		if correct_num_players >= 10 {
			if rostered_count != 10 {
				t.Error("Incorrect number of players in optimal_lineup")
			}
			break
		}
		if rostered_count != correct_num_players {
			t.Error("Incorrect number of players in optimal_lineup")
		}
	}

	// Check to see if players are being slotted into the most restrictive positions
	reverse_order := []string{"UT3", "UT2", "UT1", "C", "F", "G", "PF", "SF", "SG", "PG"}
	for _, roster := range optimal_lineup {
		for i, pos := range reverse_order {
			if player, ok := roster[pos]; ok {
				for j := i + 1; j < len(reverse_order); j++ {
					if Contains(player.ValidPositions, reverse_order[j]) { 
					   if player, ok := roster[reverse_order[j]]; ok && player.Name == "" {
							t.Error("Violator:", player.Name, "Violator position:", reverse_order[j], "Violated position:", pos)
							t.Error("Player is slotted into less restrictive position")
					   }
					}
				}
			}
		}
	}

	// Print out the optimal_lineup
	for day := 0; day < ScheduleMap[week].GameSpan + 1; day++ {
		fmt.Println("Day:", day)
		order_to_print := []string{"PG", "SG", "SF", "PF", "C", "G", "F", "UT1", "UT2", "UT3"}
		for _, pos := range order_to_print {
			fmt.Println(pos, optimal_lineup[day][pos].Name)
		}
		fmt.Println()
	}

}

func TestGetUnusedPositions(t *testing.T) {

	LoadSchedule("../static/schedule.json")

	// Retrieve team and free agent data from API
	roster_map := loaders.LoadRosterMap("resources/mock_roster.json")
	week := "15"

	// Test different thresholds to see if the correct number of unused positions are returned
	test_thresholds := []float64{0.0, 33.0, 40.0, 80.0}
	for _, test_threshold := range test_thresholds {

		new_optimal_lineup, new_streamable_players := OptimizeSlotting(roster_map, week, test_threshold)
		new_free_positions := GetUnusedPositions(new_optimal_lineup)

		taken := make(map[int]int)
		for day := range new_optimal_lineup {
			for _, player := range roster_map {
				if Contains(ScheduleMap[week].Games[player.Team], day) && player.AvgPoints > test_threshold && player.Injured == false {
					taken[day] += 1
				}
			}
		}

		for day, free_pos_roster := range new_free_positions {
			if len(new_streamable_players) >= 10 {
				if len(free_pos_roster) != 10 {
					fmt.Println(len(free_pos_roster), len(new_streamable_players))
					t.Error("Incorrect number of free positions")
				}
			} else if len(free_pos_roster) != (10 - taken[day]) {
				fmt.Println(len(free_pos_roster), 10 - taken[day])
				t.Error("Incorrect number of free positions")
			}
		}
	}

}