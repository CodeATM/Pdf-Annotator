"use client";

import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
  type Icon,
} from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useGetFavourites } from "@/hooks/apis/favourite";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useShareDialogStore } from "@/hooks/stores/otherStore";
import { useSidebarFavouritesStore } from "@/hooks/stores/otherStore";
import { useEffect } from "react";

export function NavDocuments() {
  const { favourites, loading, error, setFavourites, setLoading, setError } = useSidebarFavouritesStore();
  const { data, loading: apiLoading, error: apiError } = useGetFavourites(3);
  const router = useRouter();
  const { openDialog: openShareDialog } = useShareDialogStore();

  // Only fetch if not already loaded
  useEffect(() => {
    if (favourites.length === 0 && !loading) {
      setLoading(true);
      if (apiError) setError(apiError.message || "Failed to fetch favourites");
      if (Array.isArray(data)) setFavourites(data);
      setLoading(false);
    }
  }, [favourites.length, loading, setFavourites, setLoading, setError, data, apiError]);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Favourites</SidebarGroupLabel>
      <SidebarMenu>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <SidebarMenuItem key={i}>
                <div className="flex items-center w-full">
                  <Skeleton className="h-4 w-32" />
                </div>
              </SidebarMenuItem>
            ))
          : favourites && favourites.length > 0
          ? favourites.map((fav: any) => (
              <SidebarMenuItem key={fav.fileId || fav._id}>
                <div className="flex items-center w-full">
                  <SidebarMenuButton asChild>
                    <a href={`/docs/${fav.fileId || fav._id}`}>
                      <span
                        className="truncate max-w-[140px] block"
                        title={fav.title}
                      >
                        {fav.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:bg-accent rounded-sm ml-2">
                        <IconDots />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-24 rounded-lg"
                      side="right"
                      align="start"
                    >
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/docs/${fav.fileId || fav._id}`)
                        }
                      >
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          openShareDialog(
                            `${window.location.origin}/docs/${
                              fav.fileId || fav._id
                            }`
                          )
                        }
                      >
                        Share
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </SidebarMenuItem>
            ))
          : null}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <span>..More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
