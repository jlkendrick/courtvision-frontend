import { NextRequest, NextResponse } from "next/server";
import { DATABSE_API_ENDPOPINT } from "@/endpoints";
import { error } from "console";

// API route to GET all a user's teams
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  const response = await fetch(`${DATABSE_API_ENDPOPINT}/teams?userId=${userId}`, {
    method: "GET",
    headers: {
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
		console.log("Adding team again");
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