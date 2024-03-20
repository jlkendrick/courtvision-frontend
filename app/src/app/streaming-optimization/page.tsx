'use client';
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Header from "../../components/Header";
import { useLeague } from "../../components/LeagueContext";
import { Separator } from "../../components/ui/separator";
import StopzForm from "@/components/StopzForm";
import LineupDisplay from "../../components/LineupDisplay";

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

  const response = await fetch("http://localhost:8000/optimize/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
      body: JSON.stringify(request),
    });

  const genes: Gene[] = await response.json();
  return genes;
}

export default function StreamingOptimizationPage() {

  const [genes, setGenes] = useState<Gene[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { leagueID, leagueYear, teamName, s2, swid, threshold, week } = useLeague();
  console.log("leagueID:", leagueID);
  console.log("threshold:", threshold);
  console.log("week:", week);

  const handleSubmit = () => {

    async function fetchData() {
      if (!searchParams) {
        router.push("/");
        return;
      }

      const request: stopzRequest = {
        league_id: parseInt(leagueID),
        espn_s2: s2,
        swid: swid,
        team_name: teamName,
        year: parseInt(leagueYear),
        threshold: parseInt(threshold),
        week: week,
      };

      try {
        console.log("Making request");
        // console.log("threshold:", threshold);
        // console.log("week:", week);
        console.log(request);
        const response = await callStopzServer(request);
        setGenes(response);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();

  }

  console.log("genes:", genes.length);
  console.log(genes[0])

  return (
		
    <>
    <main className="p-4">
      <Header />
    </main>

    <section className="py-5 flex justify-center">
        <div className="flex flex-col items-center justify-center w-1/4">
          <StopzForm onSubmit={handleSubmit}/>
        </div>

        <div className="flex flex-col items-center gap-1 w-3/4">
          <h1 className="text-2xl">Welcome to Court Visionaries</h1>
          <p>Advanced tools to help you win your fantasy basketball league</p>

          <Separator orientation="horizontal" className="w-3/4 my-4 bg-primary" />

          <LineupDisplay data={genes} />
        </div>
    </section>

    </>
		
  );
}