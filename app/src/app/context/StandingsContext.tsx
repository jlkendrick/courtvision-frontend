"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useRef } from "react";

const StandingsContext = createContext({
  standings: [] as StandingsPlayer[],
  setStandings: (standings: StandingsPlayer[]) => {},
});

export interface StandingsPlayer {
  rank: number;
  player_name: string;
  total_fpts: number;
  avg_fpts: number;
  rank_change: number;
}

export const StandingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [standings, setStandings] = useState<StandingsPlayer[]>([]);
	const { setLoading } = useAuth();

  const pathname = usePathname();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (
      pathname === "/standings" &&
      standings.length === 0 &&
      !fetchedRef.current
    ) {
      setLoading(true);
      fetchStandings();
      fetchedRef.current = true;
    }
  }, [pathname, standings.length]);

  // ----------------------------------- Fetch the player fantasy points standings -----------------------------------
  const fetchStandings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/data/etl/fpts-standings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.log("Error getting player fantasy points standings.");
        toast.error("Error getting player fantasy points standings.");
        return;
      }

      const data = await response.json();
      setStandings(data.data);
      setLoading(false);
    } catch (error) {
      console.log("Internal server error. Please try again later.");
      toast.error("Internal server error. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <StandingsContext.Provider value={{ standings, setStandings }}>
      {children}
    </StandingsContext.Provider>
  );
};

export const useStandings = () => useContext(StandingsContext);
