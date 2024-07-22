import { NextRequest, NextResponse } from "next/server";
import { DATABSE_API_ENDPOPINT } from "@/endpoints";

// API route to verify the code
export async function POST(request: NextRequest): Promise<NextResponse> {
	const body = await request.json();

  console.log("EMAIL", body);
  const response = await fetch(`${DATABSE_API_ENDPOPINT}/users/verify/check-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
	if (!response.ok) {
		return NextResponse.json({ error: "Failed to validate code in api layer." }, { status: 400 });
	}
  const data = await response.json();
  if (!data.success) {
    return NextResponse.json({ error: "Email not found." }, { status: 400 });
  }
  return NextResponse.json(data);
}