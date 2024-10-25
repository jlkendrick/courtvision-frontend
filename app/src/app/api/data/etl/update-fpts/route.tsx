import { NextRequest, NextResponse } from "next/server";
import { PROD_BACKEND_ENDPOINT, LOCAL_BACKEND_ENDPOINT } from "@/endpoints";
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

  const response = await fetch(`${PROD_BACKEND_ENDPOINT}/db/etl/start-update-fpts`, {
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


// API route to GET the updated FPTS data from the backend server  --------------------------------------------
export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log("GET request to /api/data/etl/update-fpts");
  
  const { searchParams } = new URL(request.url);
  const cron_token = searchParams.get("cron_token");

  if (!cron_token) {
    console.log("No authorization token");
    return NextResponse.json({ error: "No authorization token" }, { status: 400 });
  }

  const CRON_TOKEN = process.env.CRON_TOKEN;
  if (cron_token !== CRON_TOKEN) {
    console.log("Invalid token");
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }


  const params = new URLSearchParams({ cron_token: cron_token ?? "" });
  const response = await fetch(`${PROD_BACKEND_ENDPOINT}/db/etl/get_fpts_data?cron_token` + params.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.log("Error getting updated FPTS data");
    return NextResponse.json({ error: "Error occurred getting updated FPTS data." }, { status: 400 });
  }

  const data = await response.json();
  return NextResponse.json(data);
}


// API route to listen for the response from the backend server for when it is done with the ETL process  --------------------------------------------
export async function PUT(request: NextRequest): Promise<NextResponse> {
  console.log("PUT request to /api/data/etl/update-fpts");
  const CRON_TOKEN = "c5bd89c4f876d5797401c02df81b71d90d40330014656b13735dee316c2b3241";
  const token = request.headers.get("Authorization")?.split(" ")[1].trim();

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
    const formattedData = typeof data === "string" ? JSON.stringify(JSON.parse(data), null, 2) : JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, formattedData);
    console.log("Data successfully written to file");
    return NextResponse.json({ message: "Data successfully written to file." });
  } catch (error) {
    console.log("Error writing to file: ", error);
    return NextResponse.json({ error: "Failed to write data to file." }, { status: 500 });
  }
}
