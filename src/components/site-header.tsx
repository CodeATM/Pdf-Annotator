"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useUserStore } from "@/hooks/stores/userStore";
import { FileUploadDialog } from "./molecues/global/uploadDialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { UserIcon, Bell, FileText, CheckCircle2, MessageCircle, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { create } from "zustand";

// Richer dummy notifications
const dummyNotifications = [
  {
    id: 1,
    type: "share",
    title: "Document shared with you",
    description: "John Doe shared 'Project Plan.pdf' with you.",
    time: "2m ago",
    user: {
      name: "John Doe",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    icon: <Share2 className="text-blue-500" />,
  },
  {
    id: 2,
    type: "access",
    title: "Access request approved",
    description: "Your request to access 'Budget.xlsx' was approved.",
    time: "10m ago",
    user: {
      name: "System",
      avatar: "",
    },
    icon: <CheckCircle2 className="text-green-500" />,
  },
  {
    id: 3,
    type: "comment",
    title: "New comment",
    description: "Anna commented on 'Design Mockup'.",
    time: "1h ago",
    user: {
      name: "Anna Smith",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    icon: <MessageCircle className="text-purple-500" />,
  },
  {
    id: 4,
    type: "file",
    title: "File uploaded",
    description: "You uploaded 'Invoice.pdf'.",
    time: "2h ago",
    user: {
      name: "You",
      avatar: "",
    },
    icon: <FileText className="text-gray-400" />,
  },
];

// Zustand store for notification dialog
interface NotificationDialogState {
  open: boolean;
  setOpen: (open: boolean) => void;
}
export const useNotificationDialogStore = create<NotificationDialogState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

export function SiteHeader() {
  const { user, loading } = useUserStore();
  const { open, setOpen } = useNotificationDialogStore();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {loading || !user ? (
          <Skeleton className="h-6 w-48" />
        ) : (
          <h1 className="text-base font-medium">{`Welcome back, ${user?.firstName}`}</h1>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            className="cursor-pointer"
            onClick={() => setOpen(true)}
          >
            <Bell />
          </Button>
          <UserDropdown
            user={user}
            loading={loading}
            onProfileClick={() => console.log("Profile clicked")}
            onSettingsClick={() => console.log("Settings clicked")}
            onLogoutClick={() => console.log("Logout clicked")}
          />
        </div>
      </div>
      <NotificationDialog open={open} setOpen={setOpen} />
    </header>
  );
}

function NotificationDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm w-full p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-0 divide-y divide-muted-foreground/10 max-h-[60vh] overflow-y-auto">
          {dummyNotifications.length === 0 ? (
            <span className="text-muted-foreground p-4">No notifications</span>
          ) : (
            dummyNotifications.map((notif) => (
              <div
                key={notif.id}
                className="flex items-start gap-3 p-4 hover:bg-muted/60 transition-colors"
              >
                <div className="flex-shrink-0">
                  <Avatar className="h-9 w-9 bg-blue-100">
                    {notif.user.avatar ? (
                      <AvatarImage src={notif.user.avatar} alt={notif.user.name} />
                    ) : (
                      <AvatarFallback className="bg-blue-500 text-white font-bold">
                        {notif.user.name && notif.user.name.length > 0
                          ? notif.user.name[0]
                          : <UserIcon className="h-4 w-4" />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {notif.icon}
                    <span className="font-medium text-sm truncate">
                      {notif.title}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {notif.description}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {notif.time}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface UserDropdownProps {
  user: any;
  loading: boolean;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onLogoutClick: () => void;
}

export function UserDropdown({
  user,
  loading,
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
}: UserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="focus:outline-none focus:ring-0 active:bg-transparent hover:bg-transparent p-0"
        >
          <Avatar className="h-7 w-7 bg-blue-600">
            <AvatarImage src={user?.avatar} alt={user?.firstName} />
            <AvatarFallback className="bg-blue-600 text-white font-bold text-base flex items-center justify-center">
              {user?.firstName && user.firstName.length > 0
                ? user.firstName[0]
                : <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-36">
        <DropdownMenuItem onClick={onProfileClick}>Profile</DropdownMenuItem>
        <DropdownMenuItem onClick={onSettingsClick}>Settings</DropdownMenuItem>
        <DropdownMenuItem onClick={onLogoutClick}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
