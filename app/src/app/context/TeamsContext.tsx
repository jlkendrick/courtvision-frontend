"use client";
import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";

interface TeamsContextType {
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
  teams: string[];
  setTeams: Dispatch<SetStateAction<string[]>>;
  fetchTeams: () => void;
  addTeam: (league_id: string, team_name: string, year: string, espn_s2?: string, swid?: string, ) => void;
}

const TeamsContext = createContext<TeamsContextType>({
  selectedTeam: "",
  setSelectedTeam: (team: string) => {},
  teams: [],
  setTeams: () => {},
  fetchTeams: () => {},
  addTeam: (league_id: string, team_name: string, year: string, espn_s2?: string, swid?: string, ) => {},
});

interface leagueInfoRequest {
  league_id: number;
  espn_s2?: string;
  swid?: string;
  team_name: string;
  year: number;
}

export const TeamsProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [teams, setTeams] = useState<string[]>([] as string[]);
  const { userId } = useAuth();

  const fetchTeams = async () => {};

  const addTeam = async (league_id: string,  team_name: string, year: string, espn_s2?: string, swid?: string) => {
    console.log("Adding team");
    const leagueInfo: leagueInfoRequest = { league_id: parseInt(league_id), espn_s2: espn_s2, swid: swid, team_name: team_name, year: parseInt(year) };
    try {
      // API call to add team
      console.log("HEREEEEE")
      const response = await fetch("/api/data/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, leagueInfo }),
      });
      if (!response.ok) {
        throw new Error("Failed to login.");
      }
      const data = await response.json();

      if (data.team_id) {
        // Add team successful
        toast.success("Team added successfully.");

      } else if (data.already_exists) {
        // Team already exists under user

        toast.error("You have already added this team to your account.");
      }

    } catch (error) {
      toast.error("Internal server error. Please try again later.");
    }
  }


  return (
    <TeamsContext.Provider value={{ selectedTeam, setSelectedTeam, teams, setTeams, fetchTeams, addTeam }}>
      {children}
    </TeamsContext.Provider>
  );
};

export const useTeams = () => useContext(TeamsContext);
