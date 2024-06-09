import { NextRequest, NextResponse } from "next/server";
import { DATABSE_API_ENDPOPINT } from "@/endpoints";

// API route to GET all a user's teams

// interface ExtendedRequestInit extends RequestInit {
// 	duplex?: 'half';  
// }

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