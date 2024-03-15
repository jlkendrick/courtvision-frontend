"use client";
import { createContext, useContext, useState } from "react";

const LeagueContext = createContext({
    leagueID: "",
    leagueYear: "",
    teamName: "",
    s2: "",
    swid: "",
    foundLeague: false,
    setLeagueID: (leagueID: string) => {},
    setLeagueYear: (leagueYear: string) => {},
    setTeamName: (teamName: string) => {},
    setS2: (s2: string) => {},
    setSwid: (swid: string) => {},
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
    const [foundLeague, setLeagueFound] = useState(false);

    return (
        <LeagueContext.Provider
            value={{
                leagueID,
                leagueYear,
                teamName,
                s2,
                swid,
                foundLeague,
                setLeagueID,
                setLeagueYear,
                setTeamName,
                setS2,
                setSwid,
                setLeagueFound,
            }}
        >
            {children}
        </LeagueContext.Provider>
    );
}
