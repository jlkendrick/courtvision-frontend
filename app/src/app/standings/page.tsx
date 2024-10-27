"use client";

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
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-40 w-[1000px]" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

export default function Rankings() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Standings</h1>
      </div>
      <div className="flex flex-1 justify-center rounded-lg border border-primary border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 w-full">
          <div className="flex flex-col items-center mt-5">
            <p className="text-sm text-center text-gray-500">
              Last updated: Today <br />
            </p>
          </div>
          <StandingsDisplay />
        </div>
      </div>
    </>
  );
}

function StandingsDisplay() {
  const { standings } = useStandings();

  return (
    <Card className="mt-5 w-full">
      <CardContent className="flex justify-center mb-[-20px] w-full">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead className="w-[50%] text-center">Name</TableHead>
              <TableHead className="text-center">Total FPTS/G</TableHead>
              <TableHead className="text-center">Average FPTS/G</TableHead>
              <TableHead className="w-[100px] text-center">
                Rank Change
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((player: StandingsPlayer, index: number) => {
              return (
                <TableRow className="text-center" key={index}>
                  <TableCell>{player.rank}</TableCell>
                  <TableCell>{player.player_name}</TableCell>
                  <TableCell>{player.total_fpts}</TableCell>
                  <TableCell>{Math.round(player.avg_fpts * 10) / 10}</TableCell>
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
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
