"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  MoreVertical,
  User as UserIcon,
  Users,
  Shield,
  Trash2,
  Check,
  X,
  PenSquare,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGetCollaborators, useUpdateRole, useRemoveCollaborator } from "@/hooks/apis/colaborators";
import { useGetAccessRequest, useApproveAccessRequest, useDenyAccessRequest, useDeleteAccessRequest } from "@/hooks/apis/access";
import { Skeleton } from "@/components/ui/skeleton";

const statusColor: { [key: string]: string } = {
  pending: "bg-orange-100 text-orange-800",
  approved: "bg-green-100 text-green-800",
  denied: "bg-red-100 text-red-800",
};

const roleColor: { [key: string]: string } = {
  viewer: "bg-blue-100 text-blue-800",
  editor: "bg-purple-100 text-purple-800",
};

interface AccessRequest {
  _id: string;
  fileId: string;
  requesterId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Contributor {
  id: number | string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const AccessControlPage = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const router = useRouter();
  const [dialog, setDialog] = useState<{
    type: null | "approve" | "deny" | "delete";
    request: AccessRequest | null;
  }>({ type: null, request: null });
  const [contributorDialog, setContributorDialog] = useState<{
    type: null | "changeRole" | "remove";
    contributor: Contributor | null;
  }>({ type: null, contributor: null });
  const [selectedRole, setSelectedRole] = useState("viewer");
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch collaborators
  const { loading: collaboratorsLoading, onGetCollaborators, data: collaboratorsData } = useGetCollaborators();
  const { loading: updatingRole, onUpdate } = useUpdateRole();
  const { loading: removingCollaborator, onRemoveCollaborator } = useRemoveCollaborator();
  
  // Fetch access requests
  const { loading: accessRequestsLoading, onGetAccessRequests, data: accessRequestsData } = useGetAccessRequest();
  
  // Access request action hooks
  const { loading: approvingRequest, onApproveRequest } = useApproveAccessRequest();
  const { loading: denyingRequest, onDenyRequest } = useDenyAccessRequest();
  const { loading: deletingRequest, onDeleteRequest } = useDeleteAccessRequest();

  // Transform API data to Contributor[]
  const contributorsFromAPI: Contributor[] =
    Array.isArray(collaboratorsData?.collaborators)
      ? collaboratorsData.collaborators.map((c: any) => ({
          id: c.userId?._id || c._id,
          userId: c.userId?._id,
          firstName: c.userId?.firstName || "",
          lastName: c.userId?.lastName || "",
          email: c.userId?.email || "",
          role: c.role,
        }))
      : [];

  // Transform API data to AccessRequest[]
  const accessRequestsFromAPI: AccessRequest[] = 
    Array.isArray(accessRequestsData?.requests)
      ? accessRequestsData.requests
      : [];

  // When collaboratorsData changes, update contributors state
  React.useEffect(() => {
    if (Array.isArray(collaboratorsData?.collaborators)) {
      setContributors(
        collaboratorsData.collaborators.map((c: any) => ({
          id: c.userId?._id || c._id,
          userId: c.userId?._id,
          firstName: c.userId?.firstName || "",
          lastName: c.userId?.lastName || "",
          email: c.userId?.email || "",
          role: c.role,
        }))
      );
    }
  }, [collaboratorsData]);

  // Fetch collaborators and access requests on mount or when fileId changes
  React.useEffect(() => {
    if (fileId) {
      setIsInitialLoad(true);
      let finished = 0;
      const checkDone = () => {
        finished++;
        if (finished === 2) setIsInitialLoad(false);
      };
      onGetCollaborators({ fileId, successCallback: checkDone, errorCallback: checkDone });
      onGetAccessRequests({ fileId, successCallback: checkDone, errorCallback: checkDone });
    }
  }, [fileId]);

  const handleAction = (
    type: "approve" | "deny" | "delete",
    request: AccessRequest
  ) => {
    setDialog({ type, request });
    if (type === "approve") setSelectedRole("viewer");
  };

  const handleContributorAction = (
    type: "changeRole" | "remove",
    contributor: Contributor
  ) => {
    setContributorDialog({ type, contributor });
    if (type === "changeRole") setSelectedRole(contributor.role);
  };

  const handleConfirm = async () => {
    if (!dialog.request) return;
    
    const { type, request } = dialog;
    
    try {
      if (type === "approve") {
        await onApproveRequest({
          fileId,
          userId: request.requesterId._id,
          payload: { role: selectedRole },
          successCallback: () => {
            // Refresh both access requests and collaborators lists
            onGetAccessRequests({ fileId });
            onGetCollaborators({ fileId });
            setDialog({ type: null, request: null });
          },
        });
      } else if (type === "deny") {
        await onDenyRequest({
          fileId,
          userId: request.requesterId._id,
          successCallback: () => {
            // Refresh the access requests list
            onGetAccessRequests({ fileId });
            setDialog({ type: null, request: null });
          },
        });
      } else if (type === "delete") {
        await onDeleteRequest({
          fileId,
          userId: request.requesterId._id,
          successCallback: () => {
            // Refresh the access requests list
            onGetAccessRequests({ fileId });
            setDialog({ type: null, request: null });
          },
        });
      }
    } catch (error) {
      console.error("Error handling access request action:", error);
    }
  };

  const handleContributorConfirm = async () => {
    if (!contributorDialog.contributor) return;
    if (contributorDialog.type === "changeRole") {
      console.log("Role update payload:", {
        userId: contributorDialog.contributor.userId,
        role: selectedRole,
      });
      console.log("Contributor object:", contributorDialog.contributor);
      await onUpdate({
        fileId,
        payload: {
          userId: contributorDialog.contributor.userId,
          role: selectedRole,
        },
        successCallback: () => {
          console.log("Role update success callback fired");
          setContributors((prev) =>
            prev.map((c) =>
              c.userId === contributorDialog.contributor?.userId
                ? { ...c, role: selectedRole }
                : c
            )
          );
          setContributorDialog({ type: null, contributor: null });
        },
      });
    } else if (contributorDialog.type === "remove") {
      await onRemoveCollaborator({
        fileId,
        userId: contributorDialog.contributor.userId,
        successCallback: () => {
          // Refresh the collaborators list
          onGetCollaborators({ fileId });
          setContributorDialog({ type: null, contributor: null });
        },
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if any action is loading
  const isActionLoading = approvingRequest || denyingRequest || deletingRequest || removingCollaborator;

  return (
    <div className="p-6 w-full max-w-full">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {/* Modern Header */}
      <div className="relative flex flex-col gap-2 p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-100 shadow mb-8 border border-blue-100">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-200 text-blue-700 shadow-lg">
            <Shield className="w-7 h-7" />
          </span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Access Control</h1>
            <p className="text-base text-gray-600 font-medium">Manage access for file: <span className="font-semibold text-blue-700">{fileId}</span></p>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <Tabs defaultValue="contributors" className="w-full">
        <TabsList className="flex gap-2 bg-gray-100 rounded-full p-2 mb-4 shadow-sm w-fit mx-auto">
          <TabsTrigger
            value="contributors"
            className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-blue-700 transition-all"
          >
            <Users className="h-4 w-4" />
            Contributors <span className="ml-2 bg-blue-100 text-blue-700 rounded-full px-2 text-xs font-bold">{contributors.length}</span>
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-purple-700 transition-all"
          >
            <Shield className="h-4 w-4" />
            Requests <span className="ml-2 bg-purple-100 text-purple-700 rounded-full px-2 text-xs font-bold">{accessRequestsFromAPI.length}</span>
          </TabsTrigger>
        </TabsList>

        {/* Contributors List - Responsive, Clean Card Layout */}
        <TabsContent value="contributors" className="mt-4">
          <div className="flex flex-col gap-4">
            {isInitialLoad || collaboratorsLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-2xl border p-4 gap-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-3 w-40 rounded" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                ))}
              </>
            ) : contributors.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 bg-white rounded-2xl border">
                <Users className="w-8 h-8 text-gray-300 mb-2" />
                <span className="font-semibold text-gray-400">No contributors yet</span>
              </div>
            ) : (
              contributors.map((contributor) => (
                <div
                  key={contributor.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-2xl border p-4 gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 text-blue-700 font-bold text-xl">
                      {contributor.firstName[0]}
                      {contributor.lastName[0]}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-base text-gray-900">
                        {contributor.firstName} {contributor.lastName}
                      </span>
                      <span className="text-gray-500 text-sm break-all">{contributor.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Badge className={roleColor[contributor.role] + " capitalize px-3 py-1 rounded-full text-xs font-semibold"}>
                      {contributor.role}
                    </Badge>
                    <TooltipProvider>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 focus:ring-2 focus:ring-blue-400"
                              onClick={() => handleContributorAction("changeRole", contributor)}
                            >
                              <PenSquare className="h-4 w-4 text-blue-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Change Role</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 focus:ring-2 focus:ring-red-400"
                              onClick={() => handleContributorAction("remove", contributor)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove Access</TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Requests List - Responsive, Clean Card Layout */}
        <TabsContent value="requests" className="mt-4">
          <div className="flex flex-col gap-4">
            {isInitialLoad || accessRequestsLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-2xl border p-4 gap-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-3 w-40 rounded" />
                        <Skeleton className="h-3 w-24 rounded" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                ))}
              </>
            ) : accessRequestsFromAPI.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 bg-white rounded-2xl border">
                <Shield className="w-8 h-8 text-gray-300 mb-2" />
                <span className="font-semibold text-gray-400">No access requests</span>
              </div>
            ) : (
              accessRequestsFromAPI.map((req) => (
                <div
                  key={req._id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-2xl border p-4 gap-4 ${req.status === "denied" ? "opacity-60" : ""}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-orange-100 text-orange-700 font-bold text-xl">
                      {req.requesterId.firstName[0]}
                      {req.requesterId.lastName[0]}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-base text-gray-900">
                        {req.requesterId.firstName} {req.requesterId.lastName}
                      </span>
                      <span className="text-gray-500 text-sm break-all">{req.requesterId.email}</span>
                      <span className="text-xs text-gray-400 mt-1">Requested: {formatDate(req.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Badge className={statusColor[req.status] + " capitalize px-3 py-1 rounded-full text-xs font-semibold"}>
                      {req.status}
                    </Badge>
                    <TooltipProvider>
                      <div className="flex gap-1">
                        {req.status === "pending" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 focus:ring-2 focus:ring-green-400"
                                onClick={() => handleAction("approve", req)}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Approve</TooltipContent>
                          </Tooltip>
                        )}
                        {req.status === "pending" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 focus:ring-2 focus:ring-orange-400"
                                onClick={() => handleAction("deny", req)}
                              >
                                <X className="h-4 w-4 text-orange-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Deny</TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 focus:ring-2 focus:ring-red-400"
                              onClick={() => handleAction("delete", req)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Access Request Dialogs */}
      <Dialog
        open={!!dialog.type}
        onOpenChange={(open) =>
          !open && setDialog({ type: null, request: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog.type === "approve" && "Approve Access Request"}
              {dialog.type === "deny" && "Deny Access Request"}
              {dialog.type === "delete" && "Delete Access Request"}
            </DialogTitle>
            <DialogDescription>
              {dialog.type === "approve" && (
                <>
                  Select the role to grant for{" "}
                  <b>
                    {dialog.request?.requesterId.firstName} {dialog.request?.requesterId.lastName}
                  </b>
                  :
                </>
              )}
              {dialog.type === "deny" && (
                <>
                  Are you sure you want to deny access for{" "}
                  <b>
                    {dialog.request?.requesterId.firstName} {dialog.request?.requesterId.lastName}
                  </b>
                  ?
                </>
              )}
              {dialog.type === "delete" && (
                <>
                  Are you sure you want to delete the access request for{" "}
                  <b>
                    {dialog.request?.requesterId.firstName} {dialog.request?.requesterId.lastName}
                  </b>
                  ?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {dialog.type === "approve" && (
            <div className="my-4">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isActionLoading}>Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleConfirm}
              variant={dialog.type === "delete" ? "destructive" : "default"}
              disabled={isActionLoading}
            >
              {isActionLoading ? "Processing..." : (
                <>
                  {dialog.type === "approve" && "Approve"}
                  {dialog.type === "deny" && "Deny"}
                  {dialog.type === "delete" && "Delete"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contributor Dialogs */}
      <Dialog
        open={!!contributorDialog.type}
        onOpenChange={(open) =>
          !open && setContributorDialog({ type: null, contributor: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {contributorDialog.type === "changeRole" && "Change Role"}
              {contributorDialog.type === "remove" && "Remove Access"}
            </DialogTitle>
            <DialogDescription>
              {contributorDialog.type === "changeRole" && (
                <>
                  Select the new role for{" "}
                  <b>
                    {contributorDialog.contributor?.firstName}{" "}
                    {contributorDialog.contributor?.lastName}
                  </b>
                  :
                </>
              )}
              {contributorDialog.type === "remove" && (
                <>
                  Are you sure you want to remove access for{" "}
                  <b>
                    {contributorDialog.contributor?.firstName}{" "}
                    {contributorDialog.contributor?.lastName}
                  </b>
                  ?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {contributorDialog.type === "changeRole" && (
            <div className="my-4">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleContributorConfirm}
              variant={
                contributorDialog.type === "remove"
                  ? "destructive"
                  : "default"
              }
              disabled={updatingRole}
            >
              {contributorDialog.type === "changeRole" && (updatingRole ? "Updating..." : "Change Role")}
              {contributorDialog.type === "remove" && "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccessControlPage;
