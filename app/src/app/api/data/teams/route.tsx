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

  console.log("Token:", token)

  const response = await fetch(`${DATABSE_API_ENDPOPINT}/teams`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch teams in api layer.");
  }
  const data = await response.json();
  return NextResponse.json(data);
}

// API route to POST a new team to the user's account
export async function POST(request: NextRequest): Promise<NextResponse> {
    console.log("POST request to /api/data/teams");
    const { userId, leagueInfo } = await request.json();
    const response = await fetch(`${DATABSE_API_ENDPOPINT}/teams/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    	body: JSON.stringify({ user_id: userId, league_info: leagueInfo }),
    });
		if (!response.ok) {
			throw new Error("Failed to create team in api layer.");
		}
		const data = await response.json();
		return NextResponse.json(data);
  }