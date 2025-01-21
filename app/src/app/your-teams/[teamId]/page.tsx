"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useTeams, RosterPlayer } from "@/app/context/TeamsContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TeamDetails({
  params,
}: {
  params: { teamId: string };
}) {
  console.log("Rendering TeamDetails");
  const { teamId } = params;

  const { isLoggedIn } = useAuth();
  const { rosterInfo, getLineupInfo } = useTeams();

  console.log("isLoggedIn: ", isLoggedIn);
  
  if (isLoggedIn && teamId) {
    getLineupInfo(parseInt(teamId));
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Your Teams</h1>
      </div>
      <div className="flex flex-1 justify-center rounded-lg border border-primary border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          {isLoggedIn ? (
            <>
              {rosterInfo && rosterInfo.length > 0 && (
                <div className="flex flex-wrap justify-center items-center gap-6 relative z-10 py-10 max-w-7xl mx-auto">
                  <RosterDisplay roster={rosterInfo} />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 mt-5">
              <p className="text-sm text-gray-500">You are not logged in.</p>
              <p className="text-sm text-gray-500">
                Please login to view your teams.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function RosterDisplay({ roster }: { roster: RosterPlayer[] }) {
  roster.sort((a, b) => b.avg_points - a.avg_points);
  var total_avg_points = 0;
  var total_players = 0;

  return (
    <Card className="mt-5">
      <CardContent className="flex justify-center mb-[-20px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="w-[75px]">Team</TableHead>
              <TableHead className="w-[120px] text-center">
                Avg Points
              </TableHead>
              <TableHead className="w-[120px] text-center">Positions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roster.map((player: RosterPlayer, index: number) => {
              total_avg_points += player.avg_points;
              total_players += 1;
              return (
                <>
                  <TableRow>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{player.team}</TableCell>
                    <TableCell>{player.avg_points}</TableCell>
                    <TableCell>
                      {player.valid_positions
                        .slice(0, player.valid_positions.length - 3)
                        .join(", ")}
                    </TableCell>
                  </TableRow>
                </>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <CardHeader className="text-left mb-[-25px]"></CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Roster Average Points</TableHead>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="w-[75px]"></TableHead>
            <TableHead className="w-[120px] text-center">
              {(total_avg_points / total_players).toFixed(2)}
            </TableHead>
            <TableHead className="w-[120px] text-center"></TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    </Card>
  );
}
