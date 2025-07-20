"use client";
import React, { useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { useUserStore } from "@/hooks/stores/userStore";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { fetchUser } = useUserStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await fetchUser();
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchData();
  }, [fetchUser]);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 16)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="">{children}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}