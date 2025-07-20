"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MainSingleFile from "@/components/molecues/files/MainSingleFile";
import SingleFileSidebar from "@/components/molecues/files/SingleFileSidebar";
import { useGetFile } from "@/hooks/apis/file";
import { useRequestAccess } from "@/hooks/apis/access";
import { useGetCollaborators } from "@/hooks/apis/colaborators";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import EditPdfDialog from "@/components/molecues/files/EditPdfDialog";
import { useFileMetaStore } from "@/hooks/stores/otherStore";
import AppLayout from "@/components/molecues/global/GlobalLayout";
// Type for collaborator data
interface Collaborator {
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  role: string;
  _id: string;
}

// Loading Skeleton with real collaborator avatars
const DocumentLoadingSkeleton = ({
  collaborators = [],
}: {
  collaborators: Collaborator[];
}) => {
  return (
    <div
      className="flex w-full overflow-auto"
      style={{ height: `calc(100vh - calc(var(--spacing) * 20))` }}
    >
      {/* Main PDF Area Skeleton */}
      <div className="border-r-[1px] min-h-full flex-1 flex-col">
        {/* Toolbar Skeleton */}
        <div className="z-10 sticky top-0 bg-white border-b-[1px] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
        {/* PDF Content Skeleton */}
        <div className="flex-1 min-h-0 p-6">
          <div className="max-w-4xl mx-auto">
            {[1, 2, 3].map((page) => (
              <div key={page} className="mb-8">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((line) => (
                        <Skeleton
                          key={line}
                          className={`h-4 ${
                            line % 3 === 0
                              ? "w-3/4"
                              : line % 2 === 0
                              ? "w-full"
                              : "w-5/6"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Sidebar Skeleton */}
      <div className="w-[calc(var(--sidebar-width)_+_50px)] min-h-full py-4 md:py-2 border-l h-full flex flex-col bg-white">
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-auto px-4 py-4 text-sm text-gray-800">
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="flex justify-between items-start">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between items-start">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex justify-between items-start">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-18 rounded-full" />
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex -space-x-2">
                    {collaborators.length > 0
                      ? collaborators.slice(0, 4).map((collab, i) => {
                          const name =
                            collab.userId?.firstName ||
                            collab.userId?._id ||
                            "?";
                          const bg = `#${(
                            (name.charCodeAt(0) * 0xabcdef) %
                            0xffffff
                          ).toString(16)}`;
                          return (
                            <Avatar
                              key={collab.userId?._id || i}
                              className="w-6 h-6 border-2 border-white"
                            >
                              <AvatarImage
                                src={collab.userId?.avatarUrl || ""}
                                alt={collab.userId?.firstName}
                              />
                              <AvatarFallback
                                style={{ background: bg, color: "#fff" }}
                              >
                                {collab.userId?.firstName
                                  ? collab.userId.firstName[0]
                                  : "?"}
                              </AvatarFallback>
                            </Avatar>
                          );
                        })
                      : [1, 2, 3, 4].map((i) => (
                          <Skeleton
                            key={i}
                            className="w-6 h-6 rounded-full border-2 border-white"
                          />
                        ))}
                  </div>
                </div>
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                  <div className="pl-6">
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const page = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const { onGetFile, loading } = useGetFile();
  const {
    loading: loadingCollaborators,
    onGetCollaborators,
    data: collaboratorsData,
  } = useGetCollaborators();
  const [showRequestAccess, setShowRequestAccess] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const setFileMeta = useFileMetaStore((state) => state.setFileMeta);
  const clearFileMeta = useFileMetaStore((state) => state.clearFileMeta);

  // Fetch and update Zustand store
  const refetchFile = () => {
    if (!fileId) return;
    setIsInitialLoad(true);
    onGetFile({
      fileId,
      successCallback: (fileData: any) => {
        setIsInitialLoad(false);
        setFileMeta({
          fileId: fileData?.fileId,
          title: fileData?.title,
          description: fileData?.description,
          status: fileData?.status,
          size: fileData?.size,
          createdAt: fileData?.createdAt,
          updatedAt: fileData?.updatedAt,
          fileUrl: fileData?.fileUrl,
          annotations: fileData?.annotations,
        });
      },
      errorCallback: () => setIsInitialLoad(false),
    });
  };

  useEffect(() => {
    if (!fileId) return;
    setIsInitialLoad(true);
    onGetFile({
      fileId,
      successCallback: (fileData: any) => {
        setIsInitialLoad(false);
        setFileMeta({
          fileId: fileData?.fileId,
          title: fileData?.title,
          description: fileData?.description,
          status: fileData?.status,
          size: fileData?.size,
          createdAt: fileData?.createdAt,
          updatedAt: fileData?.updatedAt,
          fileUrl: fileData?.fileUrl,
          annotations: fileData?.annotations,
        });
      },
      errorCallback: (error: any) => {
        if (error?.response?.status === 401) {
          setShowRequestAccess(true);
        } else if (error?.response?.status === 404) {
          setNotFound(true);
        }
        setIsInitialLoad(false);
      },
    });
    onGetCollaborators({
      fileId,
      successCallback: () => {},
      errorCallback: () => {},
    });
    return () => clearFileMeta();
  }, [fileId]);

  // Extract collaborators array with proper typing
  const collaborators: Collaborator[] = Array.isArray(
    collaboratorsData?.collaborators
  )
    ? collaboratorsData.collaborators
    : [];

  return (
    <AppLayout>
      <div
        className="flex w-full overflow-auto"
        style={{
          height: `calc(100vh - calc(var(--spacing) * 20))`,
        }}
      >
        {isInitialLoad || loading || loadingCollaborators ? (
          <DocumentLoadingSkeleton collaborators={[]} />
        ) : notFound ? (
          <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center">
            <img
              src="/icons/404.jpg"
              alt="File Not Found"
              className="w-64 h-64 mb-6 opacity-80"
            />
            <h2 className="text-3xl font-bold mb-2">File Not Found</h2>
            <p className="text-lg text-gray-500 mb-6">
              Sorry, the file you are looking for does not exist or has been
              removed.
            </p>
            <Button
              variant="default"
              onClick={() => (window.location.href = "/dashboard")}
            >
              Go to Dashboard
            </Button>
          </div>
        ) : showRequestAccess ? (
          <AccessRequestComponent
            setShowRequestAccess={setShowRequestAccess}
            fileId={fileId}
          />
        ) : (
          <>
            <MainSingleFile />
            <SingleFileSidebar onFileUpdated={refetchFile} />
          </>
        )}
      </div>
    </AppLayout>
  );
};

const AccessRequestComponent = ({ setShowRequestAccess }: any) => {
  const { fileId } = useParams<{ fileId: string }>();
  const { onGetAccess, loading } = useRequestAccess();
  const router = useRouter();

  const handleRequestAccess = async () => {
    await onGetAccess({
      fileId,
      successCallback: () => {
        router.push("/dashboard");
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center">
      <img
        src="/icons/access.jpg"
        alt="File Not Found"
        className="w-64 h-64 mb-6 opacity-80"
      />
      <h2 className="text-2xl font-semibold mb-4">Request Access</h2>
      <p className="mb-6">
        You do not have access to this file. Would you like to request access?
      </p>
      <div className="flex gap-4 justify-center">
        <Button variant="secondary" onClick={() => setShowRequestAccess(false)}>
          Cancel
        </Button>
        <Button
          variant="default"
          onClick={handleRequestAccess}
          disabled={loading}
        >
          {loading ? "Requesting..." : "Request Access"}
        </Button>
      </div>
    </div>
  );
};

export default page;
