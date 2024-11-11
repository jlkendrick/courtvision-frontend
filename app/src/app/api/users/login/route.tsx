import { NextRequest, NextResponse } from 'next/server';
import { PROD_BACKEND_ENDPOINT, LOCAL_BACKEND_ENDPOINT } from "@/endpoints";

// API route to create a new user account
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
	const response = await fetch (`${PROD_BACKEND_ENDPOINT}/db/users/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, password })
	})
	if (!response.ok) {
		return NextResponse.json({ error: "Failed to login user in api layer." }, { status: 400 });
	}
	const data = await response.json();
	return NextResponse.json(data);
}

// Response format
// {
    // user_id: int,
    // success: boolean,
// }