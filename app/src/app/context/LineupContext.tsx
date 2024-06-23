"use client";
import { createContext, useContext, useState } from "react";
import { useTeams } from "@/app/context/TeamsContext";
import { toast } from "sonner";

interface LineupContextType {
  genes: Gene[];
  setGenes: (genes: Gene[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  generateLineup: (threshold: string, week: string) => void;
}

const LineupContext = createContext<LineupContextType>({
  genes: [],
  setGenes: (genes: Gene[]) => {},
  isLoading: false,
  setIsLoading: (isLoading: boolean) => {},
  generateLineup: (threshold: string, week: string) => {},
});

interface Player {
  name: string;
  avg_points: number;
  team: string;
  valid_positions: string[];
  injured: boolean;
}

interface Gene {
  Roster: Record<string, Player>;
  NewPlayers: Record<string, Player>;
  Day: number;
  Acquisitions: number;
  DroppedPlayers: Player[];
  Bench: Player[];
}

export const LineupProvider = ({ children }: { children: React.ReactNode }) => {
  const [genes, setGenes] = useState<Gene[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { selectedTeam } = useTeams();

  const generateLineup = async (threshold: string, week: string) => {
    setIsLoading(true);

    try {
      // API call to add team
      const response = await fetch("/api/data/lineups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedTeam, threshold, week }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate lineup.");
      }
      const data = await response.json();
      setGenes(data);

    } catch (error) {
      toast.error("Internal server error. Please try again later.");
    }

    setIsLoading(false);
  };

  return <LineupContext.Provider value={{ genes, setGenes, isLoading, setIsLoading, generateLineup }}>{children}</LineupContext.Provider>;
};

export const useLineup = () => useContext(LineupContext);
