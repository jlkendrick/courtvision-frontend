"use client";
import { useState } from "react";
// import { useLeague } from "@/components/LeagueContext";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import StopzForm from "@/components/StopzForm";
import LineupDisplay from "@/components/LineupDisplay";

function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

interface stopzRequest {
  [key: string]: string | number | undefined;
  league_id: number;
  espn_s2?: string;
  swid?: string;
  team_name: string;
  year: number;
  threshold: number;
  week: string;
}

interface Player {
  name: string;
  avg_points: number;
  team: string;
  valid_positions: string[];
  injured: boolean;
}

interface Gene {
  Roster: Record<string, Player>;
  NewPlayers: Record<string, Player>;
  Day: number;
  Acquisitions: number;
  DroppedPlayers: Player[];
  Bench: Player[];
}

async function callStopzServer(request: stopzRequest) {
  const response = await fetch(
    "https://stopz-server-2wfwsao3zq-uc.a.run.app/optimize/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  const genes: Gene[] = await response.json();
  return genes;
}

export default function LineupGeneration() {
  const [genes, setGenes] = useState<Gene[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // const { leagueID, leagueYear, teamName, s2, swid, threshold, week } = useLeague();
  const makeRequest = false;

  const handleSubmit = () => {
    setIsLoading(true);

    async function fetchData() {
      // const request: stopzRequest = {
      //   league_id: parseInt(leagueID),
      //   espn_s2: s2,
      //   swid: swid,
      //   team_name: teamName,
      //   year: parseInt(leagueYear),
      //   threshold: parseInt(threshold),
      //   week: week,
      // };

      try {
        console.log("Making request");
        // console.log("threshold:", threshold);
        // console.log("week:", week);
        // console.log(request);
        // const response = await callStopzServer(request);
        // setGenes(response);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  };

  return (
    <>
      <>
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Lineup Generation</h1>
        </div>
        <div className="flex flex-1 justify-center rounded-lg border border-dashed shadow-sm">
          <section className="py-5 flex-row gap-3">
            <div>
              <StopzForm onSubmit={handleSubmit} />
            </div>

            <div className="flex flex-col items-center">
              <Separator
                orientation="horizontal"
                className="w-3/4 my-4 bg-primary"
              />
              {isLoading ? (
                <>
                  <SkeletonCard />
                </>
              ) : (
                <LineupDisplay data={genes} />
              )}
            </div>
          </section>
        </div>
      </>
    </>
  );
}
