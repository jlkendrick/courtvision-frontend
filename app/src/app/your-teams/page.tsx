"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useTeams, RosterPlayer } from "@/app/context/TeamsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Teams() {
  const { isLoggedIn } = useAuth();
  const { teams, rosterInfo, getLineupInfo } = useTeams();

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Your Teams</h1>
      </div>
      <div className="flex flex-1 justify-center rounded-lg border border-primary border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          {isLoggedIn ? (
            <>
              {teams.length > 0 ? (
                <div className="flex flex-col items-center mt-5">
                  <p className="text-sm text-gray-500">
                    Select a team using the dropdown and then click the button
                    below.
                  </p>
                  <Button onClick={getLineupInfo} className="mt-2 w-[20rem]">
                    View Team
                  </Button>
                  {rosterInfo.length > 0 ? (
                    <>
                    <RosterDisplay roster={rosterInfo} />
                    <p className="py-10 text-sm text-gray-500">More in-depth analysis coming soon!</p>
                    </>
                  ) : (
                    ""
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm text-gray-500">
                    You have added no teams to your account.
                  </p>
                  <p className="text-sm text-gray-500">
                    Manage your teams in your account or in the dropdown.
                  </p>
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
            <TableHead className="w-[120px] text-center">{(total_avg_points / total_players).toFixed(2)}</TableHead>
            <TableHead className="w-[120px] text-center"></TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    </Card>
  );
}
