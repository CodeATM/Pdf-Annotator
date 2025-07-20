"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, User, Paperclip, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Pencil1Icon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEditPdfDialogStore, useFileMetaStore } from "@/hooks/stores/otherStore";
import EditPdfDialog from "./EditPdfDialog";
import CollaboratorsDialog from "@/components/molecues/global/CollaboratorsDialog";

const tabs = [
  { label: "Activity", value: "activity" },
  { label: "Comments", value: "comments" },
];

const SingleFileSidebar = ({ onFileUpdated }: { onFileUpdated?: () => void }) => {
  const meta = useFileMetaStore();
  // Use meta for sidebar display
  const displayData = meta;
  const toMegabytes = (bytes: any) => {
    return (bytes / (1024 * 1024)).toFixed(2); // converts to MB and rounds to 2 decimals
  };
  const [activeTab, setActiveTab] = useState("activity");
  const { isOpen, openDialog, closeDialog, fileData } = useEditPdfDialogStore();
  const [editTab, setEditTab] = useState("details");
  const [title, setTitle] = useState(meta?.title || "");
  const [description, setDescription] = useState(meta?.description || "");
  const [showCollaboratorsDialog, setShowCollaboratorsDialog] = useState(false);
  const router = useRouter();

  // Use collaborators prop if provided, else fallback to data.collaborators or []
  const realCollaborators = Array.isArray(meta?.collaborators)
    ? meta.collaborators
    : [];

  return (
    <>
      <div className="w-[calc(var(--sidebar-width)_+_50px)] min-h-full py-4 md:py-2 border-l h-full flex flex-col bg-white">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-full"
        >
          {/* Main Scrollable Content */}
          <div className="flex-1 overflow-auto px-4 py-4 text-sm text-gray-800 custom-scroll">
            {/* Project Overview Section */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold">{displayData?.title}</h2>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDialog(meta)}
                    className="p-2"
                    aria-label="Edit file details"
                  >
                    <Pencil1Icon className="w-6 cursor-pointer" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/docs/${meta?.fileId}/access`)}
                    className="p-2"
                    aria-label="File access settings"
                  >
                    <Shield className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center text-xs text-muted-foreground gap-2">
                <Calendar size={14} />
                <span>
                  Created:{" "}
                  {displayData?.createdAt
                    ? format(new Date(displayData.createdAt), "MMMM d, yyyy – h:mm a")
                    : "N/A"}
                </span>
              </div>

              <div className="grid gap-3 text-sm">
                <InfoRow label="Status">
                  <Badge
                    className="bg-yellow-100 text-yellow-800 capitalize "
                    variant="secondary"
                  >
                    {displayData?.status}
                  </Badge>
                </InfoRow>

                <InfoRow label="Size">
                  <span className="text-muted-foreground text-xs">
                    {toMegabytes(displayData?.size)} MB
                  </span>
                </InfoRow>

                <InfoRow label="Last updated">
                  <span>
                    {displayData?.updatedAt
                      ? format(
                          new Date(displayData.updatedAt),
                          "MMMM d, yyyy – h:mm a"
                        )
                      : "N/A"}
                  </span>
                </InfoRow>

                <InfoRow label="Access">
                  <div className="flex gap-1 flex-wrap">
                    {["Task", "Wireframe", "Homepage"].map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </InfoRow>

                <InfoRow label="Collaborators">
                  <div
                    className="flex -space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setShowCollaboratorsDialog(true)}
                    title="Click to view all collaborators"
                  >
                    {realCollaborators.length > 0
                      ? realCollaborators.slice(0, 4).map((collab: any, i: number) => {
                          const name = collab.userId?.firstName || collab.userId?._id || "?";
                          const bg = `#${((name.charCodeAt(0) * 0xabcdef) % 0xffffff).toString(16)}`;
                          return (
                            <Avatar key={collab.userId?._id || i} className="w-6 h-6 border-2 border-white">
                              <AvatarImage src={collab.userId?.avatarUrl || ""} alt={collab.userId?.firstName} />
                              <AvatarFallback style={{ background: bg, color: "#fff" }}>
                                {collab.userId?.firstName ? collab.userId.firstName[0] : "?"}
                              </AvatarFallback>
                            </Avatar>
                          );
                        })
                      : [1, 2, 3, 4].map((i: number) => (
                          <Avatar key={i} className="w-6 h-6 border-2 border-white">
                            <AvatarImage src={`https://i.pravatar.cc/150?img=${i}`} />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                        ))}
                  </div>
                </InfoRow>
              </div>

              <div>
                <p className="text-xs font-medium mb-1"> Description</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {displayData.description}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <TabsList className="flex overflow-x-auto px-2 py-2 gap-2 bg-transparent">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="data-[state=active]:shadow-none px-4 text-xs data-[state=active]:rounded-none text-gray-600 font-medium data-[state=active]:border-b-[2px] data-[state=active]:border-b-[#181818] data-[state=active]:text-[#181818]"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Dynamic Tab Contents */}
            <TabsContent value="activity">
              <div className="space-y-4">
                <ActivityItem
                  user="Talan Korsgaard"
                  action='changed the status of "Design Homepage Wireframe" from To Do to In Progress'
                  time="10:45 AM"
                />
                <ActivityItem
                  user="Hanna Philips"
                  action="added reaction 🔥 in Design Homepage Wireframe"
                  time="10:20 AM"
                />
                <ActivityItem
                  user="Talan Korsgaard"
                  action="added a comment in Design Homepage Wireframe"
                  time="10:45 AM"
                />
                <ActivityItem
                  user="Davis Donin"
                  action="uploaded file User Flow"
                  time="10:45 AM"
                  fileName="User Flow"
                />
              </div>
            </TabsContent>

            <TabsContent value="comments">
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      <EditPdfDialog onFileUpdated={onFileUpdated} />
      <CollaboratorsDialog
        open={showCollaboratorsDialog}
        onOpenChange={setShowCollaboratorsDialog}
        collaborators={realCollaborators}
      />
    </>
  );
};

const InfoRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex justify-between items-start">
    <span className="text-xs font-medium">{label}</span>
    {children}
  </div>
);

const ActivityItem = ({
  user,
  action,
  time,
  fileName,
}: {
  user: string;
  action: string;
  time: string;
  fileName?: string;
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm">
        <User size={14} className="text-muted-foreground" />
        <span>
          <span className="font-medium">{user}</span> {action}
        </span>
      </div>

      {fileName && (
        <div className="flex items-center gap-2 pl-6 mt-1">
          <Paperclip size={14} className="text-muted-foreground" />
          <Button variant="outline" size="sm" className="text-xs px-2">
            {fileName}{" "}
            <span className="text-muted-foreground ml-1">PDF - 2.35MB</span>
          </Button>
        </div>
      )}

      <div className="text-xs text-muted-foreground pl-6">{time}</div>
    </div>
  );
};

export default SingleFileSidebar;
