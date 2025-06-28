import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Get refresh token from cookies
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  // TODO: Validate the refresh token and issue new tokens
  // For now, mock new tokens
  const newAccessToken = "mocked_new_access_token";
  const newRefreshToken = "mocked_new_refresh_token";

  const response = NextResponse.json({
    message: "Tokens refreshed successfully",
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    },
  });

  // Set new cookies
  response.cookies.set("accessToken", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });
  response.cookies.set("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
} 