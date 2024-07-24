import { NextRequest, NextResponse } from "next/server";
import { DATABSE_API_ENDPOPINT } from "@/endpoints";

// API route to GET all the team info for the selected team --------------------------------------------
export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log("GET request to /api/data/view-team");
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    console.log("No authorization token");
    return NextResponse.json({ error: "No authorization token" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const selected_team = searchParams.get("team_id");
  const params = new URLSearchParams({ team_id: selected_team ?? "" });
  const response = await fetch(`${DATABSE_API_ENDPOPINT}/teams/view?` + params.toString(), {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    return NextResponse.json({ error: "Failed to get team view in api layer." }, { status: 400 });
  }
  const data = await response.json();
  return NextResponse.json(data);
}