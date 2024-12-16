import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


// API route to GET a player's stats from the backend server  --------------------------------------------
export async function GET(request: NextRequest): Promise<NextResponse> {
	console.log("GET request to /api/data/etl/fpts-standings/player-stats");

	const supabaseUrl = process.env.SUPABASE_URL;
	const supabaseKey = process.env.SUPABASE_KEY;
	if (!supabaseKey || !supabaseUrl) {
		console.log("Supabase credentials not defined");
		return NextResponse.json({ error: "Supabase credentials not defined" }, { status: 400 });
	}
	const supabase = createClient(supabaseUrl, supabaseKey);

	const { searchParams } = new URL(request.url);
  const req_name = searchParams.get("player_name");
	let { data, error } = await supabase
		.rpc('get_player_stats', {
			req_name
		})
	if (error) {
		console.log("Error getting player stats.");
		return NextResponse.json({ error: "Error occurred getting player stats." }, { status: 400 });
	}

	console.log(data);

	return NextResponse.json(data);
}