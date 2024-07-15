import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SlimGene, SlimPlayer, Lineup } from "@/app/context/LineupContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function LineupDisplay({ lineup }: { lineup: Lineup }) {
  // const { week } = useLeague();

  return (
    <div className="flex flex-col items-center gap-1 w-3/4">
      {lineup.Genes.length == 0 ? (
        <h2 className="text-center">
          Enter your threshold for considering a player &quot;streamable&quot;
          and the week you wish to generate a lineup for to get started.
        </h2>
      ) : (
        <div>
          <h1 className="text-center">Optimal Lineup for Week {}</h1>
          <Carousel className="w-full max-w-xl mt-3">
            <CarouselContent>
              {lineup.Genes.map((gene: SlimGene, index: number) => (
                <CarouselItem key={index}>
                  <LineupCard gene={gene} />
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

function LineupCard({ gene }: { gene: SlimGene }) {
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

  const isPlayerNew = (player: SlimPlayer) => {
    return gene.Additions.some((addition) => addition.Name === player.Name);
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <h1 className="text-xl">Day {gene.Day + 1}</h1>
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
                  <span className="mr-2">{player.Name}</span>
                  <span className="mr-2">{player.Team}</span>
                  <span className="mr-2">{player.AvgPoints}</span>
                  <span className={`${isPlayerNew(player) ? 'text-tertiary' : 'hidden'}`}>+</span>
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
              {gene.Removals.map((player: SlimPlayer, index: number) => (
                  <div className="flex justify-between" key={index}>
                      <p>
                        <span className="mr-2">{player.Name}</span>
                        <span className="mr-2">{player.Team}</span>
                        <span className="mr-2">{player.AvgPoints}</span>
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
