"use client";
import { createContext, useContext, useState, useEffect, use } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useRef } from "react";

const StandingsContext = createContext({
  standings: [] as StandingsPlayer[],
  setStandings: (standings: StandingsPlayer[]) => {},
	loading: false,
	setLoading: (loading: boolean) => {},
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
	const [loading, setLoading] = useState(false);

  const pathname = usePathname();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (
      pathname === "/standings" &&
      standings.length === 0 &&
      !fetchedRef.current
    ) {
      // setLoading(true);
      fetchStandings();
      fetchedRef.current = true;
    }
  }, [pathname, standings.length]);

  // ----------------------------------- Fetch the player fantasy points standings -----------------------------------
  const fetchStandings = async () => {
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
    } catch (error) {
      console.log("Internal server error. Please try again later.");
      toast.error("Internal server error. Please try again later.");
    }
  };

  return (
    <StandingsContext.Provider value={{ standings, setStandings, loading, setLoading }}>
      {children}
    </StandingsContext.Provider>
  );
};

export const useStandings = () => useContext(StandingsContext);
