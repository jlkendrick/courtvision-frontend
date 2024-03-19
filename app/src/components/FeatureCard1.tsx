"use client";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLeague } from "./LeagueContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

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

function constructQueryString(path: string, request: stopzRequest) {
  const queryParams = [];

  for (const key in request) {
    if (request.hasOwnProperty(key)) {
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(request[key]!!.toString());
      queryParams.push(`${encodedKey}=${encodedValue}`);
    }
  }

  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  return path + queryString;
}


export function FeatureCard1() {

  const router = useRouter();
  const { leagueID, leagueYear, teamName, s2, swid, foundLeague } = useLeague();

  const form = useForm<z.infer<typeof stopzInput>>({
    resolver: zodResolver(stopzInput),
  });

  const handleSubmit = async (values: z.infer<typeof stopzInput>) => {
    if (foundLeague) {
      console.log("League Found");

      const request: stopzRequest = {
        league_id: parseInt(leagueID),
        espn_s2: s2,
        swid: swid,
        team_name: teamName,
        year: parseInt(leagueYear),
        threshold: parseFloat(values.threshold),
        week: values.week,
      };

      console.log(request);

      const path = "/streaming-optimization";
			const pathWithQuery = constructQueryString(path, request);
      router.push(pathWithQuery);

    } else {
      console.log("NOPE!");
    }
  };

  return (
    <Card className="w-3/4">
      <CardHeader className="mb-[-1rem]">
        <CardTitle>Streaming Optimization</CardTitle>
        <CardDescription>
          Find the optimal streaming schedule for your league.
        </CardDescription>
      </CardHeader>
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
    </Card>
  );
}
