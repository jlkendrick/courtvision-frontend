import { NextRequest, NextResponse } from "next/server";
import { DATABSE_API_ENDPOPINT } from "@/endpoints";
import path from 'path';
import fs from 'fs';

// API route to intiate the POST the new day's data to the database  --------------------------------------------
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("POST request to /api/data/etl/update-fpts");
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
    body: JSON.stringify({ cron_token: token }),
  });

  if (!response.ok) {
    console.log("Error starting ETL process");
    return NextResponse.json({ error: "Error occurred starting ETL process." }, { status: 400 });
  }

  return NextResponse.json({ message: "Successfully started ETL process, check frontend or public route to see updated data." });
}

// API route to listen for the response from the backend server for when it is done with the ETL process  --------------------------------------------
export async function PUT(request: NextRequest): Promise<NextResponse> {
  console.log("PUT request to /api/data/etl/update-fpts");
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

  const body = await request.json();
  const data = body.data;
  try {
    const filePath = path.resolve(process.cwd(), 'public/standings-data/fpts.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log("Data successfully written to file");
    return NextResponse.json({ message: "Data successfully written to file." });
  } catch (error) {
    console.log("Error writing to file: ", error);
    return NextResponse.json({ error: "Failed to write data to file." }, { status: 500 });
  }
}
