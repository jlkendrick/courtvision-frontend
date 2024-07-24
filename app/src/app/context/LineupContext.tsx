"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useTeams } from "@/app/context/TeamsContext";
import { toast } from "sonner";

interface LineupContextType {
  lineup: Lineup;
  setLineup: (lineup: Lineup) => void;
  savedLineups: Lineup[];
  setSavedLineups: (lineups: Lineup[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  generateLineup: (threshold: string, week: string) => void;
  saveLineup: () => void;
  deleteLineup: (lineupId: number) => void;
}

const LineupContext = createContext<LineupContextType>({
  lineup: {
    Id: 0,
    Lineup: [],
    Improvement: 0,
    Timestamp: "",
    Week: "",
    Threshold: 0,
  },
  setLineup: (lineup: Lineup) => {},
  savedLineups: [],
  setSavedLineups: (lineups: Lineup[]) => {},
  isLoading: false,
  setIsLoading: (isLoading: boolean) => {},
  generateLineup: (threshold: string, week: string) => {},
  saveLineup: () => {},
  deleteLineup: (lineupId: number) => {},
});

export interface SlimPlayer {
  Name: string;
  AvgPoints: number;
  Team: string;
}

export interface SlimGene {
  Day: number;
  Additions: SlimPlayer[];
  Removals: SlimPlayer[];
  Roster: Record<string, SlimPlayer>;
}

export interface Lineup {
  Id: number;
  Lineup: SlimGene[];
  Improvement: number;
  Timestamp: string;
  Week: string;
  Threshold: number;
}

export const LineupProvider = ({ children }: { children: React.ReactNode }) => {
  const [lineup, setLineup] = useState<Lineup>({Id: 0, Lineup: [], Improvement: 0, Timestamp: "", Week: "", Threshold: 0});
  const [savedLineups, setSavedLineups] = useState<Lineup[]>([{Id: 0, Lineup: [], Improvement: 0, Timestamp: "", Week: "", Threshold: 0}]);
  const [isLoading, setIsLoading] = useState(false);

  const { selectedTeam } = useTeams();

  // ---------------------------------- Generate Lineup ----------------------------------
  const generateLineup = async (threshold: string, week: string) => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      // API call to add team
      const response = await fetch("/api/data/lineups", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selected_team: selectedTeam, threshold: threshold, week: week }),
      });
      if (!response.ok) {
        toast.error("Failed to generate lineup.");
        return;
      }
      const data = await response.json();
      console.log("Generated Lineup:", data);
      setLineup(data);

    } catch (error) {
      toast.error("Internal server error. Please try again later.");
    }

    setIsLoading(false);
  };

  // ---------------------------------- Save Lineup ----------------------------------
  const saveLineup = async () => {
    try {
      const token = localStorage.getItem("token");

      // API call to add team
      const response = await fetch("/api/data/lineups", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selected_team: selectedTeam, lineup_info: lineup }),
      });
      if (!response.ok) {
        toast.error("Failed to save lineup.");
        return;
      }
      const data = await response.json();
      console.log(data);
      if (data.success) {
        toast.success("Lineup saved successfully.");
      } else if (data.already_exists) {
        toast.error("This lineup has already been saved.");
      } else {
        toast.error("Failed to save lineup.");
      }

    } catch (error) {
      toast.error("Internal server error. Please try again later.");
    }
  }

  // ---------------------------------- Fetch Saved Lineups ----------------------------------
  const fetchSavedLineups = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // API call to add team
      console.log("Fetching saved lineups for team: ", selectedTeam);
      const params = new URLSearchParams({ selected_team: selectedTeam!!.toString() });
      const response = await fetch("/api/data/lineups?" + params.toString(), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        toast.error("Failed to fetch saved lineups.");
        return;
      }
      const data = await response.json();
      console.log("Saved Lineups:", data);
      setSavedLineups(data.lineups);

    } catch (error) {
      toast.error("Internal server error. Please try again later.");
    }
  }

  // ---------------------------------- Delete a Saved Lineup ----------------------------------
  const deleteLineup = async (lineupId: number) => {

    try {
      const token = localStorage.getItem("token");

      // API call to add team
      const params = new URLSearchParams({ lineup_id: lineupId.toString() });
      const response = await fetch("/api/data/lineups?" + params.toString(), {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lineup_id: lineupId }),
      });
      if (!response.ok) {
        toast.error("Failed to delete lineup.");
        return;
      }
      const data = await response.json();
      console.log(data);
      if (data.success) {
        toast.success("Lineup deleted successfully.");
        fetchSavedLineups();
      } else {
        toast.error("Failed to delete lineup.");
      }

    } catch (error) {
      toast.error("Internal server error. Please try again");
    }
  }

  // When the selected team changes, re-fetch the saved lineups under that team
  useEffect(() => {
    if (selectedTeam) {
      fetchSavedLineups();
    }
  }, [selectedTeam]);

  return <LineupContext.Provider value={{ lineup, setLineup, savedLineups, setSavedLineups, isLoading, setIsLoading, generateLineup, saveLineup, deleteLineup }}>{children}</LineupContext.Provider>;
};

export const useLineup = () => useContext(LineupContext);
