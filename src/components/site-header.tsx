"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useUserStore } from "@/lib/userStore";
import { FileUploadDialog } from "./molecues/global/uploadDialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { UserIcon } from "lucide-react";

export function SiteHeader() {
  const { user } = useUserStore();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleFileUpload = (files: FileList | null) => {
    console.log("Uploaded files:", files);
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{`Welcome back, ${user?.firstName}`}</h1>
        <div className="ml-auto flex items-center gap-2">
          <UserDropdown
            userName={user?.firstName || "Guest"}
            onProfileClick={() => console.log("Profile clicked")}
            onSettingsClick={() => console.log("Settings clicked")}
            onLogoutClick={() => console.log("Logout clicked")}
          />
          <Button
            variant="default"
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            Add File
          </Button>
        </div>
      </div>

      {/* Reusable FileUploadDialog */}
      <FileUploadDialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onFileUpload={handleFileUpload}
      />
    </header>
  );
}

interface UserDropdownProps {
  userName: string;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onLogoutClick: () => void;
}

export function UserDropdown({
  userName,
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
}: UserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <UserIcon className="h-4 w-4" />
          {userName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onProfileClick}>Profile</DropdownMenuItem>
        <DropdownMenuItem onClick={onSettingsClick}>Settings</DropdownMenuItem>
        <DropdownMenuItem onClick={onLogoutClick}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
