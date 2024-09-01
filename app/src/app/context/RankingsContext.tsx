"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const RankingsContext = createContext({
  rankings: [] as RankingsPlayer[],
  setRankings: (rankings: RankingsPlayer[]) => {},
  selectedType: "LSTM",
  setSelectedType: (type: string) => {},
	handleValueChange: (value: string) => {},
});

interface RankingsPlayer {
  name: string;
  proj_avg: number;
  proj_total: number;
  rank: number;
}

export const RankingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [rankings, setRankings] = useState<RankingsPlayer[]>([]);
  const [selectedType, setSelectedType] = useState("LSTM");
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/rankings") {
      fetch(`/rankings-data/${selectedType}.json`)
        .then((res) => res.json())
        .then((data) => {
          setRankings(data);
        });
    }
  }, [pathname, selectedType]);

	const handleValueChange = (value: string) => {
		setSelectedType(value);
	}

  return (
    <RankingsContext.Provider
      value={{ rankings, setRankings, selectedType, setSelectedType, handleValueChange }}
    >
      {children}
    </RankingsContext.Provider>
  );
};

export const useRankings = () => useContext(RankingsContext);
