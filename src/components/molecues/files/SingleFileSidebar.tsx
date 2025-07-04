"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Share1Icon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const SingleFileSidebar = ({ data }: { data: any }) => {
  const router = useRouter();
  return (
    <div className="w-(--sidebar-width) min-h-full py-4 md:py-2">
      <Tabs defaultValue="details" className="h-full flex flex-col">
        <div className="z-10 sticky top-0 bg-white border-b-[1px]">
          <div className="px-4 lg:px-6 pt-2 border-b-[1px]">
            <TabsList className="w-full bg-transparent">
              <TabsTrigger
                value="details"
                className="flex-1 h-full rounded-none border-b-[1px] data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="flex-1 h-full rounded-none border-b-[1px] data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Comments
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <TabsContent value="details" className="h-full mt-0 p-4 lg:p-6">
            {/* Details content goes here */}
            <div className="text-sm text-muted-foreground">
              File details will be displayed here
            </div>
          </TabsContent>
          <TabsContent value="comments" className="h-full mt-0 p-4 lg:p-6">
            {/* Comments content goes here */}
            <div className="text-sm text-muted-foreground">
              Comments will be displayed here
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SingleFileSidebar;
