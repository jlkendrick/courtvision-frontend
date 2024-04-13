package main

import (
	"fmt"
	"sort"
	"net/http"
	"encoding/json"
	"main/functions"
)

func main() {

	fmt.Println("Server started on port 8080")

	// Handle request
	http.HandleFunc("/optimize/", func(w http.ResponseWriter, r *http.Request) {

		if r.Method == "OPTIONS" {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			return
		}
	
		// Set CORS headers for actual request
		w.Header().Set("Access-Control-Allow-Origin", "*")
		
		var request helper.ReqBody
		err := json.NewDecoder(r.Body).Decode(&request)
		if err != nil {
			fmt.Println(err)
			http.Error(w, "Failed to decode request body", http.StatusBadRequest)
			return
		}

		// Print the decoded request for debugging purposes
		fmt.Printf("Received request: %+v\n", request)

		// Respond with a JSON-encoded message
		json_data, err := json.Marshal(OptimizeStreaming(request))
		if err != nil {
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_, err = w.Write(json_data)
		if err != nil {
			http.Error(w, "Failed to write response", http.StatusInternalServerError)
			return
		}
	})

	// Start server
	if err := http.ListenAndServe(":8080", nil); err != nil {
		panic(err)
	}
}

func OptimizeStreaming(req helper.ReqBody) []helper.Gene {

	// Load schedule from JSON file
	helper.LoadSchedule("static/schedule.json")

	// League information
	league_id := req.LeagueId // 424233486
	espn_s2 := req.EspnS2 // ""
	swid := req.Swid // ""
	team_name := req.TeamName // "James's Scary Team"
	year := req.Year // 2024
	week := req.Week // "17"
	fa_count := 150

	// Set threshold for streamable players
	threshold := req.Threshold // 33.1

	// Retrieve team and free agent data from API
	roster_map, free_agents := helper.GetPlayers(league_id, espn_s2, swid, team_name, year, fa_count)

	// Optimize slotting and get streamable players
	optimal_lineup, streamable_players := helper.OptimizeSlotting(roster_map, week, threshold)
	fmt.Println(len(streamable_players), "streamable players")

	// Use optimal_lineup to get the spots available for streamable players
	free_positions := helper.GetUnusedPositions(optimal_lineup)

	// Create the initial population for the genetic algorithm
	size := 75
	population := make([]helper.Chromosome, size)
	helper.CreateInitialPopulation(size, population, free_agents, free_positions, week, streamable_players)


	comapare_roster := helper.Chromosome{Genes: make([]helper.Gene, helper.ScheduleMap[week].GameSpan + 1), FitnessScore: 0, TotalAcquisitions: 0, CumProbTracker: 0.0, DroppedPlayers: make(map[string]helper.DroppedPlayer)}
	for i := 0; i < helper.ScheduleMap[week].GameSpan + 1; i++ {
		comapare_roster.Genes[i] = helper.Gene{Roster: make(map[string]helper.Player), NewPlayers: make(map[string]helper.Player), Day: i, Acquisitions: 0}
	}
	helper.InsertStreamablePlayers(streamable_players, free_positions, week, &comapare_roster, streamable_players)
	helper.ScoreFitness(&comapare_roster, week)
	helper.GetTotalAcquisitions(&comapare_roster)
	games_played := 0
	for _, gene := range comapare_roster.Genes {
		games_played += len(gene.Roster)
	}
	fmt.Println("No pickups roster fitness score:", comapare_roster.FitnessScore, "games played:", games_played)


	// population = loaders.LoadInitPop("tests/resources/mock_initpop.json")

	// Run the genetic algorithm for 50 generations
	for i := 0; i < 10; i++ {

		// Score fitness of initial population and get total acquisitions
		for i := 0; i < len(population); i++ {
			helper.GetTotalAcquisitions(&population[i])
			helper.ScoreFitness(&population[i], week)
		}

		// Sort population by increasing fitness score
		sort.Slice(population, func(i, j int) bool {
			return population[i].FitnessScore < population[j].FitnessScore
		})

		population = helper.EvolvePopulation(size, population, free_agents, free_positions, streamable_players, week)

		// Print the max fitness score of the population
		// fmt.Println("Max fitness score:", population[len(population)-1].FitnessScore)
	}

	// Print the best chromosome
	other_games_played := 0
	for _, gene := range population[len(population)-1].Genes {
		other_games_played += len(gene.Roster)
	}

	best_chromosome := population[len(population)-1]
	
	// Add players from optimal_lineup to the best chromosome
	for i := 0; i < len(best_chromosome.Genes); i++ {
		for key, value := range optimal_lineup[i] {
			if value.Name != "" {
				best_chromosome.Genes[i].Roster[key] = value
			}
		}
	}

	fmt.Println("Best chromosome:", best_chromosome.TotalAcquisitions, "pickups", best_chromosome.FitnessScore, "fitness score", other_games_played, "games played")
	helper.PrintPopulation(best_chromosome, free_positions)

	// Return the best chromosome's genes
	return best_chromosome.Genes	
}