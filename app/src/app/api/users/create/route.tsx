import { NextRequest, NextResponse } from "next/server";
import { DATABSE_API_ENDPOPINT } from "@/endpoints";
import { createClient } from "@supabase/supabase-js";

// API route to create a new user account
export async function POST(request: NextRequest): Promise<NextResponse> {
  const { email, password } = await request.json();

  const supabaseURL = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  if (!supabaseURL || !supabaseKey) {
    return NextResponse.json({ error: "Supabase credentials not defined." }, { status: 400 });
  }
  const supabase = createClient(supabaseURL, supabaseKey);
  const { data, error } = await supabase.auth.admin.createUser({ email, password });
  if (error) {
    return NextResponse.json({ error: "Failed to create user in supabase." }, { status: 400 });
  }

  return NextResponse.json({ user_id: data.user.id, already_exists: false });
}

// Response format
// {
// user_id: int,
// already_exists: boolean,
// }
