"use client";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import AppLayout from "@/components/molecues/global/Applayout";
import MainSingleFile from "@/components/molecues/files/MainSingleFile";
import SingleFileSidebar from "@/components/molecues/files/SingleFileSidebar";
import { useGetFile } from "@/hooks/apis/file";

const page = () => {
  const { fileId } = useParams<{ fileId: string }>(); // Extract fileId from dynamic route
  const { onGetFile, loading, data } = useGetFile();

  useEffect(() => {
    if (!fileId) return;

    onGetFile({
      fileId,
      successCallback: () => {
        console.log(`File ${fileId} loaded successfully`);
      },
    });
    // Only run when fileId changes
  }, [fileId]);
  return (
    <div>
      <AppLayout>
        <div
          className="flex w-full overflow-auto "
          style={{
            height: `calc(100vh - calc(var(--spacing) * 20))`,
          }}
        >
          <MainSingleFile data={data} />
          <SingleFileSidebar data={data} />
        </div>
      </AppLayout>
    </div>
  );
};

export default page;
