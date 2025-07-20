"use client";
import { useEffect } from "react";
import { useUserStore } from "@/hooks/stores/userStore";

export default function AppInitializer() {
  const { user, fetchUser } = useUserStore();

  useEffect(() => {
    if (!user) fetchUser();
  }, [user, fetchUser]);

  return null;
} 