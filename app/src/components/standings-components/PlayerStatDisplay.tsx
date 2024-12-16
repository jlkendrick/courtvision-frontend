"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useStandings, StandingsPlayer } from "@/app/context/StandingsContext";

export default function PlayerStatDisplay({
  player,
}: {
  player: StandingsPlayer;
}) {
  const { playerStats } = useStandings();
  return (
    <>
      {playerStats[player.player_name] ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-secondary text-white p-4 rounded shadow">
              <h4 className="text-center text-xs">PTS/G</h4>
              <p className="text-center font-bold">
                {playerStats[player.player_name].avg_stats.avg_points}
              </p>
            </div>
            <div className="bg-secondary text-white p-4 rounded shadow">
              <h4 className="text-center text-xs">REB/G</h4>
              <p className="text-center font-bold">
                {playerStats[player.player_name].avg_stats.avg_rebounds}
              </p>
            </div>
            <div className="bg-secondary text-white p-4 rounded shadow">
              <h4 className="text-center text-xs">AST/G</h4>
              <p className="text-center font-bold">
                {playerStats[player.player_name].avg_stats.avg_assists}
              </p>
            </div>
          </div>
          <PlayerStatChart player={player} />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}

const chartConfig = {
  fpts: {
    label: "Fantasy Points",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

function PlayerStatChart({ player }: { player: StandingsPlayer }) {
  const { playerStats } = useStandings();

  return (
    <Card className="border-none">
      <CardHeader>
      <CardTitle>{player.player_name}&apos;s Fantasy Scores</CardTitle>
      </CardHeader>
      <CardContent>
        {playerStats[player.player_name] ? (
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={playerStats[player.player_name].game_logs}
              margin={{
                left: 0,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickCount={3}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="fpts"
                type="natural"
                stroke="var(--color-fpts)"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-fpts)",
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <p>Loading...</p>
        )}
      </CardContent>
    </Card>
  );
}
