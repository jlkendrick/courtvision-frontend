package helper

import (

)

// Function to find the best position for a player
func FindBestPositions(player Player, chromosome *Chromosome, free_positions map[int][]string, pos_map map[int]string, start_day int, week string) {

	// Loop through each day and find the best position for each day
	for _, day := range ScheduleMap[week].Games[player.Team] {

		// If the day is before the current day, skip it
		if day < start_day {
			continue
		}

		has_match := false
		updated_matches := GetMatches(player.ValidPositions, free_positions[day], &has_match)

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

		// If we got here, don't add the player to the chromosome
	}
}