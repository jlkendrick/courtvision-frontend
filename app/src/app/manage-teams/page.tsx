"use client";
import { ManageTeamsTable } from "@/components/ManageTeamsComponents";

export default function ManageTeams() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Manage Your Teams</h1>
      </div>
      <div className="flex-1 rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="w-full">
            <ManageTeamsTable />
          </div>
        </div>
      </div>
    </>
  );
}
