"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useTeams } from "@/app/context/TeamsContext";

export default function Teams() {
  const { isLoggedIn } = useAuth();
  const { teams } = useTeams();

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Your Teams</h1>
      </div>
      <div className="flex flex-1 justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          {isLoggedIn ? (
            <>
            {teams.length > 0 ? (
              <div className="flex flex-col mt-5">
                <p className="text-sm text-gray-500">Change the team to display using the dropdown.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm text-gray-500">You have added no teams to your account.</p>
                <p className="text-sm text-gray-500">Manage your teams in your account or in the dropdown.</p>
              </div>
            )}
            </>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm text-gray-500">You are not logged in.</p>
                <p className="text-sm text-gray-500">Please login to view your teams.</p>
              </div>
            )}

        </div>
      </div>
    </>
  );
}
