package helper

import (
	"fmt"
	"os"
	"reflect"
	"encoding/json"
	"io"
)

var ScheduleMap map[string]GameSchedule

// Function to load schedule from JSON file
func LoadSchedule() {

	json_scheule_path := "../static/schedule.json"

	// Load JSON schedule file
	json_schedule, err := os.Open(json_scheule_path)
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
	fmt.Println("Schedule loaded", ScheduleMap["13"].Games["SAS"])

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

		if _, ok := available_positions_map[valid_position]; ok {
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
func MapContainsValue(m Gene, value string) string {

	for k, v := range m.Roster {
		if v.Name == value {
			return k
		}
	}
	return ""
}