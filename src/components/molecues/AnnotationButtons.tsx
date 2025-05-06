import {
  Pencil1Icon,
  CopyIcon,
  StrikethroughIcon,
  ResetIcon,
  DownloadIcon,
  Cross2Icon,
  FileIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import { AnnotationType } from "@/lib/types";

export const ActionButtons = ({
  activeTool,
  setActiveTool,
  exportAnnotatedPdf,
  isLoading,
  annotationsExist,
  clearAll,
}: {
  activeTool: AnnotationType | null;
  setActiveTool: (tool: AnnotationType | null) => void;
  exportAnnotatedPdf: () => void;
  isLoading: boolean;
  annotationsExist: boolean;
  clearAll: () => void;
}) => (
  <div className="flex items-center gap-1">
    <button
      className="p-2 rounded-md hover:bg-zinc-100 text-zinc-700 transition-colors"
      onClick={() => setActiveTool(null)}
      title="Cancel"
    >
      <Cross2Icon className="w-5 h-5" />
    </button>
    <button
      className="p-2 rounded-md hover:bg-red-100 text-red-600 transition-colors"
      onClick={clearAll}
      title="Clear All"
    >
      <ResetIcon className="w-5 h-5" />
    </button>
    <button
      className="flex items-center gap-2 px-3 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50"
      onClick={exportAnnotatedPdf}
      disabled={isLoading || !annotationsExist}
    >
      <DownloadIcon className="w-5 h-5" />
      {isLoading ? "Exporting..." : "Export"}
    </button>
  </div>
);
