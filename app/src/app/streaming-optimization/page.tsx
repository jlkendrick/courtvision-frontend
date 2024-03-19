'use client';
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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
  console.log(genes);
  return genes;
}

export default function StreamingOptimizationPage() {
  const [makeRequest, setMakeRequest] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  if (!searchParams) {
    router.push("/");
  }

  const request: stopzRequest = {
    league_id: parseInt(searchParams!!.get("league_id")!),
    espn_s2: searchParams!!.get("espn_s2") || '',
    swid: searchParams!!.get("swid") || '',
    team_name: searchParams!!.get("team_name")!,
    year: parseInt(searchParams!!.get("year")!),
    threshold: parseFloat(searchParams!!.get("threshold")!),
    week: searchParams!!.get("week")!,
  };

  if (makeRequest) {
    setMakeRequest(false);
    console.log("Making request");
    const genes = callStopzServer(request);
    console.log(genes);
  }

  return (
		
    <div>
      <h1>Streaming Optimization</h1>
      <p>{}</p>
    </div>
		
  );
}