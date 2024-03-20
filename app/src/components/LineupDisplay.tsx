import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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

export default function LineupDisplay({ data }: { data: Gene[] }) {

  return (
    <div className="flex flex-col items-center gap-1 w-3/4">
      {data.length == 0 ? (
        <h1 className="text-center">
          Enter your threshold for considering a player &quot;streamable&quot;
          and the week you wish to generate a lineup for to get started.
        </h1>
      ) : (
        <div>
          <h1 className="text-center">Optimal Lineup for Week {}</h1>
          <Carousel className="w-full max-w-xl mt-3">
            <CarouselContent>
              {data.map((gene: Gene, index: number) => (
                <CarouselItem key={index}>
                  <Lineup gene={gene} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}
    </div>
  );
}

function Lineup({ gene }: { gene: Gene}) {

  const orderToDisplay = ["PG", "SG", "SF", "PF", "C", "G", "F", "UT1", "UT2", "UT3"];

  return (
    <Card>
      <CardHeader>
        <h1>Day {gene.Day}</h1>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          {orderToDisplay.map((position: string) => {
            const player = gene.Roster[position];
            return player ? (
              <div className="flex justify-between">
                <p>{position} {player.name} {player.team} {player.avg_points}</p>
              </div>
            ) : (
              <div className="flex justify-between">
                <p>{position} -</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  )
}