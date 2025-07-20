import {
  Pencil1Icon,
  CopyIcon,
  StrikethroughIcon,
  ResetIcon,
  DownloadIcon,
  Cross2Icon,
  FileIcon,
  ChevronDownIcon,
  Share1Icon,
} from "@radix-ui/react-icons";
import { AnnotationType } from "@/lib/types";
import { Button } from "../ui/button";
import { useShareDialogStore } from "@/hooks/stores/otherStore";
import ShareDialog from "./global/ShareDialog";
import env from "@/config/env";
import { useRouter, useParams } from "next/navigation";

export const ActionButtons = ({
  activeTool,
  setActiveTool,
  exportAnnotatedPdf,
  isLoading,
  annotationsExist,
  clearAll,
  onSave,
}: {
  activeTool: AnnotationType | null;
  setActiveTool: (tool: AnnotationType | null) => void;
  exportAnnotatedPdf: () => void;
  isLoading: boolean;
  annotationsExist: boolean;
  clearAll: () => void;
  onSave: () => void;
}) => {
  const { openDialog } = useShareDialogStore();
  const params = useParams<{ fileId: string }>();
  return (
    <>
      {" "}
      <div className="flex items-center gap-1">
        <button
          className="p-2 rounded-md hover:bg-zinc-100 text-zinc-700 transition-colors"
          onClick={() => setActiveTool(null)}
          title="Cancel"
        >
          <Cross2Icon className="w-5 h-5" />
        </button>
        {/* <button
      className="p-2 rounded-md hover:bg-red-100 text-red-600 transition-colors"
      onClick={clearAll}
      title="Clear All"
    >
      <ResetIcon className="w-5 h-5" />
    </button> */}
        <Button
          variant="ghost"
          className="cursor-pointer"
          onClick={() => {
            if (params.fileId) {
              const link = `${process.env.NEXT_PUBLIC_SHARABLE_FRONTEND_URL}/docs/${params.fileId}`;
              openDialog(link);
            } else {
              openDialog();
            }
          }}
        >
          <Share1Icon />
        </Button>

        <Button
          variant="ghost"
          // onClick={handleClose}
          className="cursor-pointer"
          disabled={isLoading || !annotationsExist}
          onClick={exportAnnotatedPdf}
        >
          <DownloadIcon className="w-5 h-5 text-[#181818] cursor-pointer " />
        </Button>
        <Button
          variant="default"
          onClick={onSave}
          className="cursor-pointer"
          disabled={isLoading || !annotationsExist}
        >
          Save
        </Button>
      </div>
      <ShareDialog />
    </>
  );
};
