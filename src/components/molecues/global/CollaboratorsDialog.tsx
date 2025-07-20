import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as React from "react";

// Import the Collaborator type from the main table file if needed
// import type { Collaborator } from "./data-table";

type Collaborator = {
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  role: string;
  _id: string;
};

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 60%)`;
  return color;
}

interface CollaboratorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaborators: Collaborator[];
}

const CollaboratorsDialog: React.FC<CollaboratorsDialogProps> = ({
  open,
  onOpenChange,
  collaborators,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Collaborators</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          {collaborators.length === 0 ? (
            <span className="text-muted-foreground">No collaborators</span>
          ) : (
            collaborators.map((collab, idx) => {
              const name = collab.userId.firstName || collab.userId._id;
              const bg = stringToColor(name + idx);
              const role = collab.role
                ? collab.role.charAt(0).toUpperCase() + collab.role.slice(1)
                : "";
              return (
                <div
                  key={collab.userId._id + idx}
                  className="flex items-center gap-3 p-2 justify-between  rounded hover:bg-muted w-full"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8 border-2 border-white">
                      <AvatarImage
                        src={collab.userId.avatarUrl || ""}
                        alt={collab.userId.firstName}
                      />
                      <AvatarFallback style={{ background: bg, color: "#fff" }}>
                        {collab.userId.firstName
                          ? collab.userId.firstName[0]
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {" "}
                        {collab.userId.lastName} {" "} {collab.userId.firstName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {collab.userId.email}
                      </span>
                    </div>
                  </div>

                  <div className="text-[16px] font-medium ">
                    {role} 
                  </div>
                </div>
              );
            })
          )}
        </div>
        <DialogClose asChild>
          <button className="mt-4 px-4 py-2 rounded bg-muted text-foreground hover:bg-muted-foreground/10">
            Close
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default CollaboratorsDialog;
