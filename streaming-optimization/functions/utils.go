package helper

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"reflect"
	"sort"
)

var ScheduleMap map[string]GameSchedule

// Function to load schedule from JSON file
func LoadSchedule(path string) {

	// Load JSON schedule file
	json_schedule, err := os.Open(path)
	if err != nil {
		fmt.Println("Error opening json schedule:", err)
	}
	defer json_schedule.Close()

	// Read the contents of the json_schedule file
	jsonBytes, err := io.ReadAll(json_schedule)
	if err != nil {
		fmt.Println("Error reading json_schedule:", err)
	}

	// Unmarshal the JSON data into ScheduleMap
	err = json.Unmarshal(jsonBytes, &ScheduleMap)
	if err != nil {
		fmt.Println("Error turning jsonBytes into map:", err)
	}

}

// Function to get a population of chromosomes
func HelperInitPop(size int, week string, threshold float64, roster_map map[string]Player, free_agents []Player) ([]Chromosome, int, []Player, map[int][]string, []Player, string) {

	LoadSchedule("../static/schedule.json")

	new_optimal_lineup, streamable_players := OptimizeSlotting(roster_map, week, threshold)
	free_positions := GetUnusedPositions(new_optimal_lineup)

	population := make([]Chromosome, size)
	CreateInitialPopulation(size, population, free_agents, free_positions, week, streamable_players)

	// Sort population by increasing fitness score
	sort.Slice(population, func(i, j int) bool {
		return population[i].FitnessScore < population[j].FitnessScore
	})

	return population, size, free_agents, free_positions, streamable_players, week
}

// Helper function to compare two chromosomes
func CompareChromosomes(chromosome1 Chromosome, chromosome2 Chromosome) bool {
	
	if len(chromosome1.Genes) != len(chromosome2.Genes) {
		return false
	}

	for i := 0; i < len(chromosome1.Genes); i++ {
		if !CompareGenes(chromosome1.Genes[i], chromosome2.Genes[i]) {
			return false
		}
	}

	return true
}

func CompareGenes(gene1 Gene, gene2 Gene) bool {
	for key, value := range gene1.Roster {
		if value.Name != gene2.Roster[key].Name {
			return false
		}
	}
	for _, bench_player := range gene1.Bench {
		if !Contains(gene2.Bench, bench_player) {
			return false
		}
	}
	for _, dropped_player := range gene2.DroppedPlayers {
		if !Contains(gene1.DroppedPlayers, dropped_player) {
			return false
		}
	}
	return true
}

// Function to loosely compare two genes, not all players have to be in the same position but rather just rostered
func LooseCompareGenes(gene1 Gene, gene2 Gene) bool {
	for _, player := range gene1.Roster {
		if MapContainsValue(gene2.Roster, player.Name) == ""{
			return false
		}
	}
	for _, bench_player := range gene1.Bench {
		if !Contains(gene2.Bench, bench_player) {
			return false
		}
	}
	for _, dropped_player := range gene2.DroppedPlayers {
		if !Contains(gene1.DroppedPlayers, dropped_player) {
			return false
		}
	}
	return true
}

// Function to convert players slice to map
func PlayersToMap(players []Player) map[string]Player {

	player_map := make(map[string]Player)

	// Convert players slice to map
	for _, player := range players {

		// Add player to map
		player_map[player.Name] = player
	}

	return player_map
}

// Function to check if a slice contains an element
func Contains(slice interface{}, value interface{}) bool {

	// Convert slice to reflect.Value
	s := reflect.ValueOf(slice)

	// Check if slice is a slice
	if s.Kind() != reflect.Slice {
		return false
	}

	// Loop through slice and check if value is in slice
	for i := 0; i < s.Len(); i++ {
		if reflect.DeepEqual(s.Index(i).Interface(), value) {
			return true
		}
	}

	return false
}

// Function to get all the positions that a free agent fits into
func GetMatches(valid_positions []string, available_positions []string, has_match *bool) []string {

	var matches []string
	available_positions_map := make(map[string]bool)

	// Create map of available positions
	for _, pos := range available_positions {
		available_positions_map[pos] = true
	}

	// Loop through each valid position and see if it is in the available positions
	for _, valid_position := range valid_positions {

		if val, ok := available_positions_map[valid_position]; ok && val {
			*has_match = true
			matches = append(matches, valid_position)
		}
	}
	return matches
}

// Function to remove an element from a slice
func Remove(slice []Player, index int) []Player {
	return append(slice[:index], slice[index+1:]...)
}

// Function to get the index of an element in a slice
func IndexOf(slice []interface{}, element interface{}) int {

	for i, e := range slice {

		if reflect.DeepEqual(e, element) {
			return i
		}
	}
	return -1
}

// Function to check if a map contains a value and return the key
func MapContainsValue(m map[string]Player, value string) string {

	for k, v := range m {
		if v.Name == value {
			return k
		}
	}
	return ""
}

// Function to print a population
func PrintPopulation(chromosome Chromosome, free_positions map[int][]string) {
	
	// Print initial population
	order_to_print := []string{"PG", "SG", "SF", "PF", "C", "G", "F", "UT1", "UT2", "UT3"}
	for _, gene := range chromosome.Genes {
		fmt.Println("Day:", gene.Day)
		fmt.Println("New Players:", gene.NewPlayers)
		fmt.Println("Bench:", gene.Bench)
		fmt.Println("Dropped Players:", gene.DroppedPlayers)
		for _, pos := range order_to_print {
			if Contains(free_positions[gene.Day], pos) {
				fmt.Println(pos, "|", gene.Roster[pos].Name)
			} else {
				fmt.Println(pos, gene.Roster[pos].Name)
			}
		}
		fmt.Println()
	}
}

// Function to print a population
func PrintPopulationWOFreePos(chromosome Chromosome) {
	
	// Print initial population
	order_to_print := []string{"PG", "SG", "SF", "PF", "C", "G", "F", "UT1", "UT2", "UT3"}
	for _, gene := range chromosome.Genes {
		fmt.Println("Day:", gene.Day)
		fmt.Println("New Players:", gene.NewPlayers)
		fmt.Println("Bench:", gene.Bench)
		for _, pos := range order_to_print {
			fmt.Println(pos, gene.Roster[pos].Name)
		}
		fmt.Println()
	}
}

// Function to find the index of a player in a slice
func SliceIndexOf(players []Player, player Player) int {
	
	for i, p := range players {
		if p.Name == player.Name {
			return i
		}
	}
	return -1
}

// Function to print a gene
func PrintGene(gene *Gene, free_positions []string) {

	order_to_print := []string{"PG", "SG", "SF", "PF", "C", "G", "F", "UT1", "UT2", "UT3"}
	fmt.Println("Day:", gene.Day)
	fmt.Println("New Players:", gene.NewPlayers)
	fmt.Println("Bench:", gene.Bench)
	for _, pos := range order_to_print {
		if Contains(free_positions, pos) {
			fmt.Println(pos, "|", gene.Roster[pos].Name)
		} else {
			fmt.Println(pos, gene.Roster[pos].Name)
		}
	}
	fmt.Println()
}