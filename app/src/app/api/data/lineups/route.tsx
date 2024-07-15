import { NextRequest, NextResponse } from "next/server";
import { DATABSE_API_ENDPOPINT } from "@/endpoints";

// API route to POST a new team to the user's account
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
    throw new Error("Failed to create team in api layer.");
  }
  const data = await response.json();
  return NextResponse.json(data);
}