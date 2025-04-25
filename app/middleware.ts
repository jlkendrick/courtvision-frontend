import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if the request is for an API route
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Return maintenance mode response for all API routes
    return NextResponse.json(
      {
        error: "Maintenance mode",
        message:
          "Court Vision is currently offline for the off-season. We'll be back for the next fantasy basketball season!",
      },
      { status: 503 }
    );
  }

  // Continue with the request for non-API routes
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/api/:path*",
};
