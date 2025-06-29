"use server";
import { cookies } from "next/headers";

export interface TokenInfo {
  accessToken: string | null;
  refreshToken: string | null;
  hasTokens: boolean;
}

export async function getCookies(): Promise<TokenInfo> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value || null;
  const refreshToken = cookieStore.get("refreshToken")?.value || null;
  return {
    accessToken,
    refreshToken,
    hasTokens: !!(accessToken && refreshToken),
  };
}
