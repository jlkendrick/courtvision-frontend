import { NextRequest, NextResponse } from "next/server";
import { DATABSE_API_ENDPOPINT } from "@/endpoints";
import * as fs from "fs";

// API route to intiate the POST the new day's data to the database and retrieve that updated data  --------------------------------------------
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("GET request to /api/data/update-fpts");
  const CRON_TOKEN = process.env.CRON_TOKEN;
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    console.log("No authorization token");
    return NextResponse.json({ error: "No authorization token" }, { status: 400 });
  }

  if (token !== CRON_TOKEN) {
    console.log("Invalid token");
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const response = await fetch(`${DATABSE_API_ENDPOPINT}/etl/update-fpts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    return NextResponse.json({ error: "Error occurred updating fpts in database." }, { status: 400 });
  }

  // Update the JSON file with the new data
  const data = await response.json();
  try {
    fs.writeFileSync("../../../../../../public/standings-data/fpts.json", JSON.stringify(data, null, 2));
  } catch (error) {
    console.log("Error writing to file: ", error);
  }

  return NextResponse.json("Successfully updated fpts in database, check frontend to see updated standings.");
}