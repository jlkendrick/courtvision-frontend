import { NextRequest, NextResponse } from "next/server";
import { DATABSE_API_ENDPOPINT } from "@/endpoints";

// API route to GET all a user's lineups for a certain team --------------------------------------------
export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log("GET request to /api/data/lineups");
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    console.log("No authorization token");
    return NextResponse.json({ error: "No authorization token" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const selected_team = searchParams.get("selected_team");
  const params = new URLSearchParams({ selected_team: selected_team ?? "" });
  const response = await fetch(`${DATABSE_API_ENDPOPINT}/lineups?` + params.toString(), {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    return NextResponse.json({ error: "Failed to get lineups in api layer." }, { status: 400 });
  }
  const data = await response.json();
  return NextResponse.json(data);
}

// API route to POST information to generate a lineup ----------------------------------
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("POST request to /api/data/teams");
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    console.log("No authorization token");
    return NextResponse.json({ error: "No authorization token" }, { status: 400 });
  }

  const body = await request.json();
  const response = await fetch(`${DATABSE_API_ENDPOPINT}/lineups/generate`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return NextResponse.json({ error: "Failed to generate lineup in api layer." }, { status: 400 });
  }
  const data = await response.json();
  return NextResponse.json(data);
}

// API route to PUT information to save a lineup ----------------------------------
export async function PUT(request: NextRequest): Promise<NextResponse> {
  console.log("PUT request to /api/data/teams");
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    console.log("No authorization token");
    return NextResponse.json({ error: "No authorization token" }, { status: 400 });
  }

  const body = await request.json();
  console.log(body);
  const response = await fetch(`${DATABSE_API_ENDPOPINT}/lineups/save`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return NextResponse.json({ error: "Failed to save lineup in api layer." }, { status: 400 });
  }
  const data = await response.json();
  return NextResponse.json(data);
}

// API route to DELETE a lineup ----------------------------------
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  console.log("DELETE request to /api/data/teams");
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    console.log("No authorization token");
    return NextResponse.json({ error: "No authorization token" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const lineup_id = searchParams.get("lineup_id");

  console.log(lineup_id);

  const params = new URLSearchParams({ lineup_id: lineup_id ?? "" });
  const response = await fetch(`${DATABSE_API_ENDPOPINT}/lineups/remove?` + params.toString(), {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  });
  if (!response.ok) {
    return NextResponse.json({ error: "Failed to delete lineup in api layer." }, { status: 400 });
  }
  const data = await response.json();
  return NextResponse.json(data);
}