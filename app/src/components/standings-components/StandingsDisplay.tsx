"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useStandings, StandingsPlayer } from "@/app/context/StandingsContext";
import { TrendingUp, TrendingDown, Minus, ArrowUpDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogContent,
  DialogHeader,
	DialogClose,
} from "../ui/dialog";
import  PlayerStatDisplay from "./PlayerStatDisplay";

export default function StandingsDisplay() {
  const { standings, fetchPlayerStats } = useStandings();
  const [sortedStandings, setSortedStandings] = useState(standings);
  const [sortConfig, setSortConfig] = useState({
    key: "total_fpts",
    direction: "desc",
  });

  // Make sure to update sortedStandings when standings changes
  useEffect(() => {
    setSortedStandings(standings);
  }, [standings]);

  const handleSort = (key: "total_fpts" | "avg_fpts") => {
    let direction = "desc";

    // If clicking the same column, toggle direction
    if (sortConfig.key === key) {
      direction = sortConfig.direction === "desc" ? "asc" : "desc";
    }

    const sorted = [...sortedStandings].sort((a, b) => {
      if (direction === "desc") {
        return b[key] - a[key];
      }
      return a[key] - b[key];
    });

    setSortedStandings(sorted);
    setSortConfig({ key, direction });
  };

  const handlePlayerClick = (player: StandingsPlayer) => {
    fetchPlayerStats(player.player_name);
  }

  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown size={16} className="text-gray-400" />;
    }
    return (
      <ArrowUpDown
        size={16}
        className={`text-primary ${
          sortConfig.direction === "asc" ? "rotate-180" : ""
        }`}
      />
    );
  };

  return (
    <Card className="mt-5 w-full">
      <CardContent className="flex justify-center mb-[-20px] w-full">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead className="w-[50%] text-center">Name</TableHead>
              <TableHead
                className="text-center cursor-pointer hover:bg-muted"
                onClick={() => handleSort("total_fpts")}
              >
                <div className="flex items-center justify-center gap-2">
                  Total FPTS
                  {getSortIcon("total_fpts")}
                </div>
              </TableHead>
              <TableHead
                className="text-center cursor-pointer hover:bg-muted"
                onClick={() => handleSort("avg_fpts")}
              >
                <div className="flex items-center justify-center gap-2">
                  Average FPTS/G
                  {getSortIcon("avg_fpts")}
                </div>
              </TableHead>
              <TableHead className="w-[100px] text-center">
                Rank Change
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStandings.map((player: StandingsPlayer, index: number) => {
              return (
                <Dialog key={index}>
                  <DialogTrigger asChild onClick={() => handlePlayerClick(player)}>
                    <TableRow className="text-center cursor-pointer">
                      <TableCell>{player.rank}</TableCell>
                      <TableCell>{player.player_name}</TableCell>
                      <TableCell>{player.total_fpts}</TableCell>
                      <TableCell>
                        {Math.round(player.avg_fpts * 10) / 10}
                      </TableCell>
                      <TableCell className="flex justify-center items-center space-x-1">
                        {player.rank_change}
                        <Separator orientation="vertical" />
                        {player.rank_change > 0 ? (
                          <TrendingUp className="text-green-500" size={20} />
                        ) : player.rank_change < 0 ? (
                          <TrendingDown className="text-red-500" size={20} />
                        ) : (
                          <Minus className="text-gray-500" size={20} />
                        )}
                      </TableCell>
                    </TableRow>
                  </DialogTrigger>
                  <DialogContent className="max-w-[900px]">
                    <DialogHeader>
                      <DialogTitle>Player Details</DialogTitle>
                      <DialogDescription>
                        Detailed stats and performance for {player.player_name}.
                      </DialogDescription>
                    </DialogHeader>

                    <PlayerStatDisplay player={player} />
                    
                    <DialogFooter>
											<DialogClose>
                      	<Button type="submit">Close</Button>
											</DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}