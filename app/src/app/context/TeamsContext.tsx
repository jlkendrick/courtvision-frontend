"use client";
import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from "react";

interface TeamsContextType {
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
  teams: string[];
  setTeams: Dispatch<SetStateAction<string[]>>;
  fetchTeams: () => void;
}

const TeamsContext = createContext<TeamsContextType>({
  selectedTeam: "",
  setSelectedTeam: (team: string) => {},
  teams: [],
  setTeams: () => {},
  fetchTeams: () => {},
});

export const TeamsProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [teams, setTeams] = useState<string[]>([] as string[]);

  const fetchTeams = async () => {};


  return (
    <TeamsContext.Provider value={{ selectedTeam, setSelectedTeam, teams, setTeams, fetchTeams }}>
      {children}
    </TeamsContext.Provider>
  );
};

export const useTeams = () => useContext(TeamsContext);
