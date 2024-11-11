import { NextRequest, NextResponse } from "next/server";
import { PROD_BACKEND_ENDPOINT, LOCAL_BACKEND_ENDPOINT } from "@/endpoints";

// API route to verify a JWT
export async function POST(request: NextRequest): Promise<NextResponse> {
	const body = await request.json();
	const token = body.token;

  const response = await fetch(`${PROD_BACKEND_ENDPOINT}/db/users/verify/auth-check`, {
    method: "GET",
    headers: {
			"Authorization": `Bearer ${token}`,
    },
  });
	if (!response.ok) {
		console.log(response);
		return NextResponse.json({ error: "Failed to check JWT in api layer." }, { status: 401 });
	}
  const data = await response.json();
	console.log(data);
  if (!data.success) {
    return NextResponse.json({ error: "Not exactly sure." }, { status: 400 });
  }
  return NextResponse.json(data);
}