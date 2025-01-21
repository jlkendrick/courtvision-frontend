"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useTeams } from "@/app/context/TeamsContext";
import Link from "next/link";

export default function Teams() {
  const { isLoggedIn } = useAuth();
  const { teams } = useTeams();

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
                      league_name={team.team_info.league_name ?? "No League Name"}
                      team_name={team.team_info.team_name}
                      league_id={team.team_info.league_id}
                      team_id={team.team_id}
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

const Team = ({
  league_name,
  team_name,
  league_id,
  team_id,
}: {
  league_name: string;
  team_name: string;
  league_id: React.ReactNode;
  team_id: number;
}) => {
  return (
    <div className="flex flex-col items-start p-6 m-2 rounded-lg border shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-neutral-900 dark:border-neutral-800">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
          {team_name}
        </h2>
      </div>
      <div className="mb-1">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          <strong>League Name:</strong> {league_name}
        </p>
      </div>
      <div className="mb-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          <strong>League ID:</strong> {league_id}
        </p>
      </div>
      <div>
        <Link
          href={`/your-teams/${team_id}`}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-orange-700 transition-colors dark:bg-orange-500 dark:hover:bg-orange-600"
        >
          View Team
        </Link>
      </div>
    </div>
  );
};