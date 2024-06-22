"use client";
import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";

interface TeamsContextType {
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
  teams: Team[];
  setTeams: Dispatch<SetStateAction<Team[]>>;
  handleManageTeamsClick: () => void;
  fetchTeams: () => void;
  addTeam: (league_id: string, team_name: string, year: string, espn_s2?: string, swid?: string, ) => void;
}

interface TeamInfo {
  team_name: string,
  league_id: number,
  year: number,
  espn_s2?: string,
  swid?: string,
}

interface Team {
  team_id: number,
  team_info: TeamInfo
};

const TeamsContext = createContext<TeamsContextType>({
  selectedTeam: "",
  setSelectedTeam: (team: string) => {},
  teams: [],
  setTeams: () => {},
  handleManageTeamsClick: () => {},
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
  const [teams, setTeams] = useState<Team[]>([]);
  const { isLoggedIn, setLoading, setPage } = useAuth();

  const handleManageTeamsClick = () => {
    setPage("manage-teams");
  }

  const fetchTeams = async () => {
    const token = localStorage.getItem("token");
    try {
      console.log("Making request to fetch teams with headers: ", token)
      const response = await fetch("/api/data/teams", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch teams.");
      }
      const data = await response.json();
      setTeams(data.teams);
    } catch (error) {
      console.log(error)
      toast.error("Internal server error. Please try again later.");
    }
  };

  const addTeam = async (league_id: string,  team_name: string, year: string, espn_s2?: string, swid?: string) => {
    console.log("Adding team");
    const token = localStorage.getItem("token");
    const leagueInfo: leagueInfoRequest = { league_id: parseInt(league_id), espn_s2: espn_s2, swid: swid, team_name: team_name, year: parseInt(year) };
    try {
      // API call to add team
      const response = await fetch("/api/data/teams", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leagueInfo }),
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

  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      fetchTeams().then(() => setLoading(true));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (teams.length > 0) {
      setSelectedTeam(teams[0].team_info.team_name);
    }
  }, [teams]);

  return (
    <TeamsContext.Provider value={{ selectedTeam, setSelectedTeam, teams, setTeams, handleManageTeamsClick, fetchTeams, addTeam }}>
      {children}
    </TeamsContext.Provider>
  );
};

export const useTeams = () => useContext(TeamsContext);
