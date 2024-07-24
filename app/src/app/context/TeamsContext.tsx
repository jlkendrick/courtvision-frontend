"use client";
import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";

interface TeamsContextType {
  selectedTeam: number | null;
  setSelectedTeam: (team_id: number) => void;
  teams: Team[];
  setTeams: Dispatch<SetStateAction<Team[]>>;
  rosterInfo: RosterPlayer[];
  handleManageTeamsClick: () => void;
  fetchTeams: () => void;
  addTeam: (league_id: string, team_name: string, year: string, espn_s2?: string, swid?: string, ) => void;
  editTeam: (team_id: number, league_id: string, team_name: string, year: string, espn_s2?: string, swid?: string) => void;
  deleteTeam: (team_id: number) => void;
  getLineupInfo: () => void;
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

export interface RosterPlayer {
  name: string,
  avg_points: number,
  team: string,
  valid_positions: string[],
  injured: boolean,
}

const TeamsContext = createContext<TeamsContextType>({
  selectedTeam: 0,
  setSelectedTeam: (team_id: number) => {},
  teams: [],
  setTeams: () => {},
  rosterInfo: [],
  handleManageTeamsClick: () => {},
  fetchTeams: () => {},
  addTeam: (league_id: string, team_name: string, year: string, espn_s2?: string, swid?: string, ) => {},
  editTeam: (team_id: number, league_id: string, team_name: string, year: string, espn_s2?: string, swid?: string) => {},
  deleteTeam: (team_id: number) => {},
  getLineupInfo: () => {},
});

interface leagueInfoRequest {
  league_id: number;
  espn_s2?: string;
  swid?: string;
  team_name: string;
  year: number;
}

export const TeamsProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [rosterInfo, setRosterInfo] = useState<RosterPlayer[]>([]);

  const { isLoggedIn, logout, setLoading, setPage } = useAuth();

  const handleManageTeamsClick = () => {
    setPage("manage-teams");
  }

  // ---------------------------------- Fetch Teams ----------------------------------
  const fetchTeams = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/data/teams", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 401) {
        toast.error("Invalid or expired token. Please log in again.");
        logout();
      }
      const data = await response.json();
      setTeams(data.teams);
    } catch (error) {
      
      toast.error("Internal server error. Please try again later.");
    }
  };

  // ---------------------------------- Add Team --------------------------------
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
        body: JSON.stringify({ league_info: leagueInfo }),
      });
      if (!response.ok) {
        throw new Error("Failed to add team.");
      }
      const data = await response.json();

      if (data.team_id) {
        // Add team successful
        toast.success("Team added successfully.");
        fetchTeams();

      } else if (data.already_exists) {
        // Team already exists under user

        toast.error("You have already added this team to your account.");
      } else if (!data.team_id) {
        // Team not added
        toast.error("Invalid league information.");
      }

    } catch (error) {
      toast.error("Internal server error. Please try again later.");
    }
  }

  // ---------------------------------- Edit Team --------------------------------
  const editTeam = async (team_id: number, league_id: string, team_name: string, year: string, espn_s2?: string, swid?: string) => {
    const token = localStorage.getItem("token");
    const leagueInfo: leagueInfoRequest = { league_id: parseInt(league_id), espn_s2: espn_s2, swid: swid, team_name: team_name, year: parseInt(year) };
    try {
      // API call to edit team
      console.log("Editing team with team_id: ", team_id, " and leagueInfo: ", leagueInfo);
      const response = await fetch("/api/data/teams", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ team_id: team_id, league_info: leagueInfo }),
      });
      if (!response.ok) {
        throw new Error("Failed to edit team.");
      }
      const data = await response.json();

      if (data.success) {
        // Edit team successful
        toast.success("Team edited successfully.");
        fetchTeams();
      } else {
        // Edit team failed
        toast.error("Edited team information invalid.");
      }

    } catch (error) {
      toast.error("Internal server error. Please try again later.");
    }
  }

  // ---------------------------------- Delete Team --------------------------------
  const deleteTeam = async (team_id: number) => {
    const token = localStorage.getItem("token");
    try {
      // API call to delete team
      const response = await fetch("/api/data/teams", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ team_id: team_id }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete team.");
      }
      const data = await response.json();

      if (data.success) {
        // Delete team successful
        toast.success("Team deleted successfully.");
        fetchTeams();
      }

    } catch (error) {
      toast.error("Internal server error. Please try again later.");
    }
  }

  // -------------------------------- Get Lineup Info ------------------------------
  const getLineupInfo = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {

      const params = new URLSearchParams({ team_id: selectedTeam!!.toString() });
      const response = await fetch("/api/data/view-team?" + params.toString(), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch lineup info.");
      }
      const data = await response.json();

      console.log(data);
      setRosterInfo(data);
      setLoading(false);

    } catch (error) {
      toast.error("Internal server error. Please try again later.");
      setLoading(false);
    }
  }

  // ---------------------------------- Use Effects --------------------------------

  // Fetch teams on login
  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      fetchTeams().then(() => setLoading(false));
    }
  }, [isLoggedIn]);

  // Set selected team to first team in list
  useEffect(() => {
    if (teams.length > 0) {
      setSelectedTeam(teams[0].team_id);
    }
  }, [teams]);

  return (
    <TeamsContext.Provider value={{ selectedTeam, setSelectedTeam, teams, setTeams, rosterInfo, handleManageTeamsClick, fetchTeams, addTeam, editTeam, deleteTeam, getLineupInfo }}>
      {children}
    </TeamsContext.Provider>
  );
};

export const useTeams = () => useContext(TeamsContext);
