"use client";
import { createContext, useContext, useState } from "react";
import { useTeams } from "@/app/context/TeamsContext";
import { toast } from "sonner";

interface LineupContextType {
  lineup: Lineup;
  setLineup: (lineup: Lineup) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  generateLineup: (threshold: string, week: string) => void;
  saveLineup: () => void;
}

const LineupContext = createContext<LineupContextType>({
  lineup: {
    Lineup: [],
    Improvement: 0,
    Timestamp: "",
  },
  setLineup: (lineup: Lineup) => {},
  isLoading: false,
  setIsLoading: (isLoading: boolean) => {},
  generateLineup: (threshold: string, week: string) => {},
  saveLineup: () => {},
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
  Lineup: SlimGene[];
  Improvement: number;
  Timestamp: string;
}

export const LineupProvider = ({ children }: { children: React.ReactNode }) => {
  const [lineup, setLineup] = useState<Lineup>({Lineup: [], Improvement: 0, Timestamp: ""});
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
      console.log(data);
      setLineup(data);
      console.log(lineup);

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
        body: JSON.stringify({ selected_team: selectedTeam, lineup: lineup }),
      });
      if (!response.ok) {
        toast.error("Failed to save lineup.");
        return;
      }
      const data = await response.json();
      console.log(data);
      toast.success("Lineup saved successfully.");

    } catch (error) {
      toast.error("Internal server error. Please try again later.");
    }
  }

  return <LineupContext.Provider value={{ lineup, setLineup, isLoading, setIsLoading, generateLineup, saveLineup }}>{children}</LineupContext.Provider>;
};

export const useLineup = () => useContext(LineupContext);
