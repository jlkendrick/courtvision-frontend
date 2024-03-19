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
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useLeague } from "./LeagueContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface stopzRequest {
  [key: string]: string | number | undefined;
  league_id: number;
  espn_s2?: string;
  swid?: string;
  team_name: string;
  year: number;
}

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

  const handleSubmit = async () => {
    if (foundLeague) {
      console.log("League Found");

      const request: stopzRequest = {
        league_id: parseInt(leagueID),
        espn_s2: s2,
        swid: swid,
        team_name: teamName,
        year: parseInt(leagueYear),
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
    <Card className="w-3/4 flex gap-2">

      <div className="flex flex-col w-1/3 items-center justify-end mr-[-1rem]">
        <CardHeader>
          <CardTitle>Streaming Optimization</CardTitle>
        </CardHeader>
      </div>

      <div className="flex flex-col mb-3 mt-3">
        <Separator orientation="vertical"/>
      </div>

      <div className="flex flex-col w-1/2 items-center justify-center">
        <CardDescription>
          Get optimal streaming schedule for your fantasy basketball team.
        </CardDescription>
      </div>

      <div className="flex flex-col mb-3 mt-3">
        <Separator orientation="vertical"/>
      </div>
 
      <div className="flex flex-col w-1/4 items-center justify-center">
        <Button
          type="submit"
          variant="default"
          size="default"
        >
          <Image src="/arrow.png" alt="Search" width={30} height={30} />
        </Button>
      </div>

    </Card>
  );
}
