import { useEffect } from "react";
import { useUserStore } from "@/hooks/stores/userStore";

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, fetchUser } = useUserStore();

  useEffect(() => {
    if (!user) fetchUser();
  }, [user, fetchUser]);

  return <>{children}</>;
} 