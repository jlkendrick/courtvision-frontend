"use client";
import * as z from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { useLeague } from "./LeagueContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import Image from "next/image";

const stopzInput = z.object({
  threshold: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Value must be a decimal number"),
  week: z.string().min(1).regex(/^\d+$/, { message: "Week must be a number" }),
});

export default function StopzForm({ onSubmit }: { onSubmit: () => void }) {
  const { foundLeague, threshold, week, setThreshold, setWeek } = useLeague();

  const form = useForm<z.infer<typeof stopzInput>>({
    resolver: zodResolver(stopzInput),
    defaultValues: {
      threshold: "",
      week: "",
    },
  });
  const reset = form.reset;

  const handleClearClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    console.log("Clearing form");
    reset();
  };

  const handleSubmit = (data: z.infer<typeof stopzInput>) => {
    if (!foundLeague) {
      return;
    }
    console.log(data);
    setThreshold(data.threshold);
    setWeek(data.week);
  };

  useEffect(() => {
    if (foundLeague && threshold !== "" && week !== "") {
      onSubmit();
    }
  }, [foundLeague, threshold, week]);

  return (
    <div className="w-full pl-8 pr-4">
      <Card>
        <CardHeader>
          <CardTitle>Streaming Optimization</CardTitle>
          <CardDescription>
            Get the optimal streaming schedule for your fantasy basketball team.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              className="flex flex-col gap-3"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name="threshold"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>
                        Threshold
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button className="h-5 w-5 rounded-full px-0 ml-1" variant="outline">?</Button>
                            </TooltipTrigger>
                            <TooltipContent className="text-center">
                              <p>
                                Threshold is the minimum average points per game <br />
                                a player must have for you to be okay dropping them.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span style={{ color: "red" }}> *</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Threshold" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="week"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>
                        Matchup Week
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button className="h-5 w-5 rounded-full px-0 ml-1" variant="outline">?</Button>
                            </TooltipTrigger>
                            <TooltipContent className="text-center">
                              <p>
                                Matchup week is the matchup number for which you want <br />
                                to generate a lineup.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span style={{ color: "red" }}> *</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Week #" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <CardFooter className="flex justify-between pl-0 pr-0 mb-[-1rem]">
                <Button
                  type="button"
                  className="size-sm bg-primary"
                  onClick={handleClearClick}
                >
                  <Image
                    src="/clear.png"
                    alt="clear"
                    width={30}
                    height={30}
                    fill-true
                  />
                </Button>
                <Button type="submit" className="size-sm bg-primary">
                  <Image
                    src="/arrow.png"
                    alt="submit"
                    width={30}
                    height={30}
                    fill-true
                  />
                </Button>
              </CardFooter>
              {!foundLeague && (
                <p className="text-red-500 text-sm">
                  Please enter a valid league
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
