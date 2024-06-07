import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLeague } from "@/components/LeagueContext";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { week } = useLeague();

  return (
    <div className="flex flex-col items-center gap-1 w-3/4">
      {data.length == 0 ? (
        <h2 className="text-center">
          Enter your threshold for considering a player &quot;streamable&quot;
          and the week you wish to generate a lineup for to get started.
        </h2>
      ) : (
        <div>
          <h1 className="text-center">Optimal Lineup for Week {week}</h1>
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

function Lineup({ gene }: { gene: Gene }) {
  const orderToDisplay = [
    "PG",
    "SG",
    "SF",
    "PF",
    "C",
    "G",
    "F",
    "UT1",
    "UT2",
    "UT3",
  ];

  return (
    <Card>
      <CardHeader className="text-center">
        <h1 className="text-xl">Day {gene.Day}</h1>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="flex flex-col gap-1">
          {orderToDisplay.map((position: string, index: number) => {
            const player = gene.Roster[position];
            return (
              <div className="flex justify-between" key={index}>
                {player ? (
                  <p>
                  <span className="mr-2">{position}</span>
                  <span className="mr-2">{player.name}</span>
                  <span className="mr-2">{player.team}</span>
                  <span className="mr-2">{player.avg_points}</span>
                  <span className={`${gene.NewPlayers[player.name] ? 'text-tertiary' : 'hidden'}`}>+</span>
                </p>
                ) : (
                  <div className="flex items-center" key={`skeleton-${index}`}>
                    <p className="inline-block mr-2">{position}</p>
                    <Skeleton className="h-4 w-[250px]" />
                  </div>
                )}
              </div>
            );
          })}
          <div className="flex flex-col justify-between">
            <div className="flex flex-col gap-1">
              {gene.DroppedPlayers.map((player: Player, index: number) => (
                  <div className="flex justify-between" key={index}>
                      <p>
                        <span className="mr-2">{player.name}</span>
                        <span className="mr-2">{player.team}</span>
                        <span className="mr-2">{player.avg_points}</span>
                        <span className="text-primary">-</span>

                      </p>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
