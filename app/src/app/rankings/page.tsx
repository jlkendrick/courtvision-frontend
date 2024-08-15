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
import { useRankings } from "@/app/context/RankingsContext";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Rankings() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Rankings</h1>
      </div>
      <div className="flex flex-1 justify-center rounded-lg border border-primary border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 w-full">
          <div className="flex flex-col items-center mt-5">
            <p className="text-sm text-center text-gray-500">
              Last updated: 8/11/2024 <br />
              Select a ranking system using the dropdown below.
            </p>
          </div>
          <RankingsDropdown />
          <RankingsDisplay />
        </div>
      </div>
    </>
  );
}

function RankingsDropdown() {
  const { handleValueChange } = useRankings();
  return (
    <div className="mt-5">
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="LSTM" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Options</SelectLabel>
            <SelectItem value="LSTM">LSTM Neural Network</SelectItem>
            <SelectItem value="SVR">Support Vector Regression</SelectItem>

          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function RankingsDisplay() {
  const { rankings } = useRankings();

  return (
    <Card className="mt-5 w-full">
      <CardContent className="flex justify-center mb-[-20px] w-full">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead className="w-full text-center">Name</TableHead>
              <TableHead className="text-center w-full">
                Projected Average
              </TableHead>
              <TableHead className="text-center w-full">
                Projected Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.map((player: any, index: number) => {
              return (
                <TableRow key={index}>
                  <TableCell>{player.rank}</TableCell>
                  <TableCell className="text-center">{player.name}</TableCell>
                  <TableCell className="text-center">
                    {player.proj_avg}
                  </TableCell>
                  <TableCell className="text-center">
                    {player.proj_total}
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
