"use client";
import { createContext, useContext, useState } from "react";

const LeagueContext = createContext({
    leagueID: "",
    leagueYear: "",
    teamName: "",
    s2: "",
    swid: "",
    threshold: "",
    week: "",
    foundLeague: false,
    setLeagueID: (leagueID: string) => {},
    setLeagueYear: (leagueYear: string) => {},
    setTeamName: (teamName: string) => {},
    setS2: (s2: string) => {},
    setSwid: (swid: string) => {},
    setThreshold: (threshold: string) => {},
    setWeek: (week: string) => {},
    setLeagueFound: (foundLeague: boolean) => {},
});

export function useLeague() {
    return useContext(LeagueContext);
}

export function LeagueProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [leagueID, setLeagueID] = useState("");
    const [leagueYear, setLeagueYear] = useState("");
    const [teamName, setTeamName] = useState("");
    const [s2, setS2] = useState("");
    const [swid, setSwid] = useState("");
    const [threshold, setThreshold] = useState("");
    const [week, setWeek] = useState("");
    const [foundLeague, setLeagueFound] = useState(false);

    return (
        <LeagueContext.Provider
            value={{
                leagueID,
                leagueYear,
                teamName,
                s2,
                swid,
                threshold,
                week,
                foundLeague,
                setLeagueID,
                setLeagueYear,
                setTeamName,
                setS2,
                setSwid,
                setThreshold,
                setWeek,
                setLeagueFound,
            }}
        >
            {children}
        </LeagueContext.Provider>
    );
}
