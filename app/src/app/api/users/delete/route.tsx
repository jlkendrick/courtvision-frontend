import { NextRequest, NextResponse } from "next/server";
import { DATABSE_API_ENDPOPINT } from "@/endpoints";

// API route to delete a user account
export async function POST(request: NextRequest): Promise<NextResponse> {
	console.log("POST request to /api/users/delete");
  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    console.log("No authorization token");
    return NextResponse.json({ error: "No authorization token" }, { status: 400 });
  }

	const { password } = await request.json();
	const response = await fetch(`${DATABSE_API_ENDPOPINT}/users/delete`, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ password }),
	});
	if (!response.ok) {
		return NextResponse.json({ error: "Failed to delete user in api layer." }, { status: 400 });
	}
	const data = await response.json();
	return NextResponse.json(data);
}