import { AnnotationTools } from "./AnnotationTools";
import { FileIcon } from "@radix-ui/react-icons";
import { ActionButtons } from "./AnnotationButtons";
import { AnnotationType, Annotation } from "@/lib/types";

export const Toolbar = ({
  pdfFile,
  activeTool,
  setActiveTool,
  handleUndo,
  exportAnnotatedPdf,
  isLoading,
  annotations,
  clearAll,
  getRootProps,
  getInputProps,
  selectedColor,
  setSelectedColor,
}: {
  pdfFile: File | null;
  activeTool: AnnotationType | null;
  setActiveTool: (tool: AnnotationType | null) => void;
  handleUndo: () => void;
  exportAnnotatedPdf: () => void;
  isLoading: boolean;
  selectedColor: any;
  setSelectedColor: any;
  annotations: Annotation[];
  clearAll: () => void;
  getRootProps: () => any;
  getInputProps: () => any;
}) => (
  <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm border border-zinc-200">
    {!pdfFile ? (
      <div {...getRootProps()} className="w-full">
        <input {...getInputProps()} />
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors">
          <FileIcon className="w-5 h-5" />
          <span>Upload PDF</span>
        </button>
      </div>
    ) : (
      <>
        <AnnotationTools
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          handleUndo={handleUndo}
          annotationsExist={annotations.length > 0}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />
        <div className="flex-grow" />
        <ActionButtons
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          exportAnnotatedPdf={exportAnnotatedPdf}
          isLoading={isLoading}
          annotationsExist={annotations.length > 0}
          clearAll={clearAll}
        />
      </>
    )}
  </div>
);
