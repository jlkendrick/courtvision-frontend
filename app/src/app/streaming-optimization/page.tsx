'use client';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, use } from "react";

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

const stopzInput = z.object({
  threshold: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Value must be a decimal number"),
  week: z.string().min(1).regex(/^\d+$/, { message: "Week must be a number" }),
});

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

  const form = useForm<z.infer<typeof stopzInput>>({
    resolver: zodResolver(stopzInput),
  });

  const handleSubmit = () => {

    console.log("Making request");

    async function fetchData() {
      if (!searchParams) {
        router.push("/");
        return;
      }

      const request: stopzRequest = {
        league_id: parseInt(searchParams.get("league_id") || ""),
        espn_s2: searchParams.get("espn_s2") || "",
        swid: searchParams.get("swid") || "",
        team_name: searchParams.get("team_name") || "",
        year: parseInt(searchParams.get("year") || ""),
        threshold: parseFloat(searchParams.get("threshold") || ""),
        week: searchParams.get("week") || "",
      };

      try {
        console.log("Making request");
        const response = await callStopzServer(request);
        setGenes(response);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }

  useEffect(() => {
    if (genes.length > 0) {
      console.log("Thing:", genes[0].Day);
    }
  }, [genes]);


  return (
		
    <div>
      <h1>Streaming Optimization</h1>
      <button onClick={handleSubmit}>Submit</button>
      {genes.length == 0 ? (
        <p>Loading</p>
      ) : (
        <div>
          {genes.map((gene, index) => (
            <div key={index}>
              <h2>Gene {index + 1}</h2>
              <p>Day: {gene.Day}</p>
              <p>Acquisitions: {gene.Acquisitions}</p>
              <h3>Roster:</h3>
              <ul>
                {Object.values(gene.Roster).map(player => (
                  <li key={player.name}>{player.name} - {player.team}</li>
                ))}
              </ul>
              <h3>Bench:</h3>
              <ul>
                {gene.Bench.map(player => (
                  <li key={player.name}>{player.name} - {player.team}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      )}
    </div>
		
  );
}


<CardContent className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <section className="flex justify-center">
              <div className="flex flex-col items-center justify-center w-1/3 mr-2">
                <FormField
                  control={form.control}
                  name="threshold"
                  render={({ field }) => {
                    return (
                      <FormItem className="w-full">
                        <FormLabel>
                          Threshold<span style={{ color: "red" }}> *</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="ex. 30.7" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <div className="flex flex-col items-center justify-center w-1/3">
                <FormField
                  control={form.control}
                  name="week"
                  render={({ field }) => {
                    return (
                      <FormItem className="w-full">
                        <FormLabel>
                          Week<span style={{ color: "red" }}> *</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="ex. 5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <div className="flex flex-col items-center justify-end">
                <Button
                  className="ml-2"
                  type="submit"
                  variant="default"
                  size="default"
                >
                  <Image src="/arrow.png" alt="Search" width={30} height={30} />
                </Button>
              </div>
            </section>
          </form>
        </Form>
      </CardContent>