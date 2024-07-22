import { NextRequest, NextResponse } from "next/server";
import { DATABSE_API_ENDPOPINT } from "@/endpoints";

// API route to verify an email
export async function POST(request: NextRequest): Promise<NextResponse> {
	const body = await request.json();
  console.log("EMAIL", body);
  const response = await fetch(`${DATABSE_API_ENDPOPINT}/users/verify/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
	if (!response.ok) {
		return NextResponse.json({ error: "Failed to send verification email in api layer." }, { status: 400 });
	}
  const data = await response.json();
  return NextResponse.json(data);
}