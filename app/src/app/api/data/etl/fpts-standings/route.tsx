import { NextRequest, NextResponse } from "next/server";
import { PROD_BACKEND_ENDPOINT, LOCAL_BACKEND_ENDPOINT } from "@/endpoints";
import { createClient } from "@supabase/supabase-js";

// API route to intiate the POST the new day's data to the database  --------------------------------------------
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("POST request to /api/data/etl/fpts-standings");
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
export async function GET(): Promise<NextResponse> {
  console.log("GET request to /api/data/etl/fpts-standings");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  if (!supabaseKey || !supabaseUrl) {
    console.log("Supabase credentials not defined");
    return NextResponse.json({ error: "Supabase credentials not defined" }, { status: 400 });
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  let { data, error } = await supabase
    .rpc('get_fpts_data')
  if (error) {
    console.log("Error getting updated FPTS data");
    return NextResponse.json({ error: "Error occurred getting updated FPTS data." }, { status: 400 });
  }

  return NextResponse.json(data);
}