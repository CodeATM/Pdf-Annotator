"use client";
import { useState } from "react";
import { AnnotationType } from "@/lib/types";
import {
  Pencil1Icon,
  CopyIcon,
  StrikethroughIcon,
  ResetIcon,
  DownloadIcon,
  Cross2Icon,
  FileIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
} from "@radix-ui/react-icons";
import { ColorPicker } from "./ColorPicker";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

export const AnnotationTools = ({
  activeTool,
  setActiveTool,
  handleUndo,
  annotationsExist,
  selectedColor,
  setSelectedColor,
}: {
  activeTool: AnnotationType | null;
  setActiveTool: (tool: AnnotationType | null) => void;
  handleUndo: () => void;
  annotationsExist: boolean;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
}) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const handleToolClick = (tool: AnnotationType) => {
    if (activeTool === tool) {
      setIsColorPickerOpen(!isColorPickerOpen);
    } else {
      setActiveTool(tool);
      setIsColorPickerOpen(true);
    }
  };
  const router = useRouter();
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost">
        <ArrowLeftIcon
          className="size-5 cursor-pointer "
          onClick={() => router.back()}
        />
      </Button>
      {/* Highlight Button */}
      <div className="relative">
        <button
          className={`p-1.5 sm:p-2 rounded-md transition-colors ${
            activeTool === "highlight"
              ? "bg-yellow-100"
              : "hover:bg-zinc-100 text-zinc-700"
          }`}
          onClick={() => handleToolClick("highlight")}
          title="Highlight"
        >
          <CopyIcon
            className="w-4 h-4 sm:w-5 sm:h-5"
            style={{
              color:
                activeTool === "highlight"
                  ? selectedColor.replace("0.5", "1").replace("rgba", "rgb")
                  : "#71717a",
            }}
          />
        </button>
        {activeTool === "highlight" && isColorPickerOpen && (
          <ColorPicker
            selectedColor={selectedColor}
            onColorSelect={(color) => {
              setSelectedColor(color);
              setIsColorPickerOpen(false);
            }}
            isOpen={isColorPickerOpen}
            setIsOpen={setIsColorPickerOpen}
          />
        )}
      </div>

      {/* Underline Button */}
      <div className="relative">
        <button
          className={`p-1.5 sm:p-2 rounded-md transition-colors ${
            activeTool === "underline"
              ? "bg-blue-100"
              : "hover:bg-zinc-100 text-zinc-700"
          }`}
          onClick={() => handleToolClick("underline")}
          title="Underline"
        >
          <StrikethroughIcon
            className="w-4 h-4 sm:w-5 sm:h-5"
            style={{
              color:
                activeTool === "underline"
                  ? selectedColor.replace("0.5", "1").replace("rgba", "rgb")
                  : "#71717a",
            }}
          />
        </button>
        {activeTool === "underline" && isColorPickerOpen && (
          <ColorPicker
            selectedColor={selectedColor}
            onColorSelect={(color) => {
              setSelectedColor(color);
              setIsColorPickerOpen(false);
            }}
            isOpen={isColorPickerOpen}
            setIsOpen={setIsColorPickerOpen}
          />
        )}
      </div>

      {/* Comment Button */}
      <div className="relative">
        <button
          className={`p-1.5 sm:p-2 rounded-md transition-colors ${
            activeTool === "comment"
              ? "bg-orange-100"
              : "hover:bg-zinc-100 text-zinc-700"
          }`}
          onClick={() => handleToolClick("comment")}
          title="Comment"
        >
          <MessageCircle
            className="w-4 h-4 sm:w-5 sm:h-5"
            style={{
              color:
                activeTool === "comment"
                  ? "#f59e42"
                  : "#71717a",
            }}
          />
        </button>
      </div>

      {/* Signature Button */}
      <button
        className={`p-1.5 sm:p-2 rounded-md transition-colors ${
          activeTool === "signature"
            ? "bg-green-100 text-green-700"
            : "hover:bg-zinc-100 text-zinc-700"
        }`}
        onClick={() => setActiveTool("signature")}
        title="Add Signature"
      >
        <Pencil1Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <div className="h-6 w-px bg-zinc-200 mx-1" />

      {/* Undo Button */}
      <button
        className="p-2 rounded-md hover:bg-zinc-100 text-zinc-700 transition-colors disabled:opacity-50"
        onClick={handleUndo}
        disabled={!annotationsExist}
        title="Undo"
      >
        <ResetIcon className="w-5 h-5 text-[#181818]" />
      </button>
    </div>
  );
};