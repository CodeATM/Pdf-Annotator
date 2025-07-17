"use client"
import React, { useState } from "react";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { FileUp } from "lucide-react";
import { FileUploadDialog } from "./uploadDialog";
type Props = {};

const TableFilters = (props: Props) => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card " onClick={() => setDialogOpen(true)}>
          <CardFooter className="flex-col items-start gap-1.5 text-sm cursor-pointer ">
            <div className="line-clamp-1 flex gap-2 font-bold text-[24px] items-center ">
              Upload File <FileUp className="size-8" />
            </div>
            <div className="text-muted-foreground">
              Upload a file to start editing.
            </div>
          </CardFooter>
        </Card>
      </div>
      <FileUploadDialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

export default TableFilters;
