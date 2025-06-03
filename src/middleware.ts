import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("Middleware executed for:", pathname);

  // Skip middleware for login and sign-in paths
  if (
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/signin")
  ) {
    console.log("Skipping middleware for login or sign-in routes.");
    return NextResponse.next();
  }

  // Check for authentication token
  const authToken = request.cookies.get("accessToken")?.value;
  console.log("Auth Token:", authToken);

  if (!authToken) {
    console.log("No token, redirecting to login...");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  console.log("Token found, allowing access...");
  return NextResponse.next();
}

// Protect specific paths with the matcher
export const config = {
  matcher: ["/home/:path*"], // Protect /home and its subdirectories
};
