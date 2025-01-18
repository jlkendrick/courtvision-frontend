"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useTeams, RosterPlayer } from "@/app/context/TeamsContext";
import { cn } from "@/lib/utils";
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
              <div className="flex flex-wrap justify-center items-center gap-6 relative z-10 py-10 max-w-7xl mx-auto">
                {teams.map((team, index) => (
                  <Team
                    key={team.team_id}
                    title={team.team_info.league_name ?? "No League Name"}
                    description={team.team_info.team_name}
                    icon={team.team_info.league_id}
                    index={index}
                  />
                ))}
              </div>
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

const Team = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "m-1 flex flex-col rounded-lg border lg:border-r  py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
