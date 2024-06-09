"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
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
import { useState } from "react";
import { useLeague } from "../app/context/LeagueContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

const leagueInfoSchema = z.object({
  leagueID: z
    .string()
    .min(1)
    .regex(/^\d+$/, { message: "League ID must be a number" }),
  leagueYear: z
    .string()
    .min(1)
    .regex(/^\d+$/, { message: "League Year must be a number" }),
  teamName: z.string().min(1),
  s2: z.string().optional(),
  swid: z.string().optional(),
});

interface leagueInfoRequest {
  league_id: number;
  espn_s2?: string;
  swid?: string;
  team_name: string;
  year: number;
}

export default function LeagueInfoForm() {
  const router = useRouter();
  const {
    foundLeague,
    threshold,
    week,
    setLeagueID,
    setLeagueYear,
    setTeamName,
    setS2,
    setSwid,
    setLeagueFound,
    setThreshold,
    setWeek,
  } = useLeague();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof leagueInfoSchema>>({
    resolver: zodResolver(leagueInfoSchema),
    defaultValues: {
      leagueID: "",
      leagueYear: "",
      teamName: "",
      s2: "",
      swid: "",
    },
  });
  const reset = form.reset;

  const handleClearClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (threshold) {
      setThreshold("");
    }
    if (week) {
      setWeek("");
    }
    setLeagueFound(false);
    setIncorrectInfo(false);
    setSubmitted(false);
    reset();
  };

  const [incorrectInfo, setIncorrectInfo] = useState(false);

  const handleSubmit = async (values: z.infer<typeof leagueInfoSchema>) => {
    setSubmitted(true);

    if (threshold) {
      setThreshold("");
    }
    if (week) {
      setWeek("");
    }
    console.log(values);

    const request: leagueInfoRequest = {
      league_id: parseInt(values.leagueID),
      espn_s2: values.s2,
      swid: values.swid,
      team_name: values.teamName,
      year: parseInt(values.leagueYear),
    };

    const response = await fetch(
      "https://espn-fantasy-server-2wfwsao3zq-uc.a.run.app/validate_league/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    const data = await response.json();
    console.log(data);

    setSubmitted(false);

    if (data.valid) {
      setLeagueFound(true);
      setIncorrectInfo(false);

      setLeagueID(values.leagueID);
      setLeagueYear(values.leagueYear);
      setTeamName(values.teamName);
      if (values.s2) {
        setS2(values.s2);
      }
      if (values.swid) {
        setSwid(values.swid);
      }

      router.push("/dashboard");
    } else {
      setLeagueFound(false);
      setIncorrectInfo(true);
    }
  };

  return (
    <div className="w-full pl-8 pr-4">
      <Card className={` ${foundLeague ? "border-tertiary" : ""}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>League Info</CardTitle>
              <CardDescription>
                Find your ESPN fantasy basketball league or{" "}
                <Link
                  href="/dashboard"
                  className="text-blue-500 underline hover:text-blue-700 font-medium"
                >
                  skip
                </Link>
                .
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-3"
            >
              <FormField
                control={form.control}
                name="leagueID"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>
                        League ID
                        <span style={{ color: "red" }}> *</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          className={
                            foundLeague ? "focus-visible:ring-tertiary" : ""
                          }
                          placeholder="ID"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="leagueYear"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>
                        League Year<span style={{ color: "red" }}> *</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          className={
                            foundLeague ? "focus-visible:ring-tertiary" : ""
                          }
                          placeholder="YYYY"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="teamName"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>
                        Team Name<span style={{ color: "red" }}> *</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          className={
                            foundLeague ? "focus-visible:ring-tertiary" : ""
                          }
                          placeholder="Name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <hr className={` ${foundLeague ? "border-tertiary" : ""}`}></hr>
              <CardDescription>For private leagues.</CardDescription>

              <FormField
                control={form.control}
                name="s2"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>ESPN s2</FormLabel>
                      <FormControl>
                        <Input
                          className={
                            foundLeague ? "focus-visible:ring-tertiary" : ""
                          }
                          placeholder="s2"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="swid"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>SWID</FormLabel>
                      <FormControl>
                        <Input
                          className={
                            foundLeague ? "focus-visible:ring-tertiary" : ""
                          }
                          placeholder="SWID"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <CardFooter className="flex justify-between pl-0 pr-0 mb-[-1rem]">
                <Button
                  type="button"
                  className={`size-sm bg-primary ${
                    foundLeague ? "bg-tertiary hover:bg-teriary/90" : ""
                  }`}
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
                <Button
                  type="submit"
                  className={`size-sm bg-primary ${
                    foundLeague ? "bg-tertiary hover:bg-teriary/90" : ""
                  }`}
                >
                  <Image
                    src="/arrow.png"
                    alt="submit"
                    width={30}
                    height={30}
                    fill-true
                  />
                </Button>
              </CardFooter>
              <CardDescription
                className={`text-center ${
                  incorrectInfo ? "text-red-500" : "hidden"
                }`}
              >
                Incorrect League Info
              </CardDescription>
              <CardDescription
                className={`text-center ${
                  foundLeague ? "text-tertiary" : "hidden"
                }`}
              >
                Found League!
              </CardDescription>
              <div className="text-center justify-center items-center">
                <Skeleton
                  className={` ${
                    submitted
                      ? "h-4 w-full justify-center items-center"
                      : "hidden"
                  }`}
                ></Skeleton>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
