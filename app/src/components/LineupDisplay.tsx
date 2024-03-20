import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

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

export default function LineupDisplay({ data }: { data: any }) {
  return (
    <div className="flex flex-col items-center gap-1 w-3/4">
      {data.length == 0 ? (
        <h1 className="text-center">
          Enter your threshold for considering a player &quot;streamable&quot;
          and the week you wish to generate a lineup for to get started.
        </h1>
      ) : (
        <div>
          <h1 className="text-center">Optimal Lineup for Week {data.week}</h1>
          <Carousel className="w-full max-w-xs">
            <CarouselContent>
              {data.map((gene: Gene, index: number) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        <span className="text-4xl font-semibold">
                        </span>
                      </CardContent>
                    </Card>
                  </div>
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
