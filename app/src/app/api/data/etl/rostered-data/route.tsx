import { NextRequest, NextResponse } from "next/server";
import { PROD_BACKEND_ENDPOINT, LOCAL_BACKEND_ENDPOINT } from "@/endpoints";

// API route to intiate the POST the new day's data to the database  --------------------------------------------
export async function POST(request: NextRequest): Promise<NextResponse> {
	console.log("POST request to /api/data/etl/rostered-data");
	const CRON_TOKEN = process.env.CRON_TOKEN;
	const token = request.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		console.log("No authorization token");
		return NextResponse.json({ error: "No authorization token" }, { status: 400 });
	}

	if (token !== CRON_TOKEN) {
		console.log("Invalid token");
		return NextResponse.json({ error: "Invalid token" }, { status: 400 });
	}

	const response = await fetch(`${PROD_BACKEND_ENDPOINT}/data/etl/start-update-rostered`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ cron_token: token }),
	});

	if (!response.ok) {
		console.log("Error starting ETL process");
		return NextResponse.json({ error: "Error occurred starting ETL process." }, { status: 400 });
	}

	return NextResponse.json({ message: "Successfully started ETL process, check frontend or public route to see updated data." });
}