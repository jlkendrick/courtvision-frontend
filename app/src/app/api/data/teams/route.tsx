import { NextRequest, NextResponse } from "next/server";
import { DATABSE_API_ENDPOPINT } from "@/endpoints";

// API route to GET all a user's teams
export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log("GET request to /api/data/teams");
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    console.log("No authorization token");
    return NextResponse.json({ error: "No authorization token" }, { status: 400 });
  }

  const response = await fetch(`${DATABSE_API_ENDPOPINT}/teams`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    return NextResponse.json({ error: "Failed to get teams in api layer." }, { status: 400 });
  }
  const data = await response.json();
  return NextResponse.json(data);
}

// API route to POST a new team to the user's account
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("POST request to /api/data/teams");
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    console.log("No authorization token");
    return NextResponse.json({ error: "No authorization token" }, { status: 400 });
  }

  const body = await request.json();
  console.log("Body: ", body);
  const response = await fetch(`${DATABSE_API_ENDPOPINT}/teams/add`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return NextResponse.json({ error: "Failed to add team in api layer." }, { status: 400 });
  }
  const data = await response.json();
  return NextResponse.json(data);
}

// API route to DELETE a team from the user's account
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  console.log("DELETE request to /api/data/teams");
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    console.log("No authorization token");
    return NextResponse.json({ error: "No authorization token" }, { status: 400 });
  }

  const body = await request.json();
  const response = await fetch(`${DATABSE_API_ENDPOPINT}/teams/remove`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return NextResponse.json({ error: "Failed to remove team in api layer." }, { status: 400 });
  }
  const data = await response.json();
  return NextResponse.json(data);
}

// API route to PUT a team's information
export async function PUT(request: NextRequest): Promise<NextResponse> {
  console.log("PUT request to /api/data/teams");
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    console.log("No authorization token");
    return NextResponse.json({ error: "No authorization token" }, { status: 400 });
  }

  const body = await request.json();
  const response = await fetch(`${DATABSE_API_ENDPOPINT}/teams/update`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return NextResponse.json({ error: "Failed to update team in api layer." }, { status: 400 });
  }
  const data = await response.json();
  return NextResponse.json(data);
}