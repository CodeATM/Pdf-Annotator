import { AnnotationTools } from "../AnnotationTools";
import { FileIcon } from "@radix-ui/react-icons";
import { ActionButtons } from "../AnnotationButtons";
import { AnnotationType, Annotation } from "@/lib/types";

export const NavToolbar = ({
  pdfFile,
  activeTool,
  setActiveTool,
  handleUndo,
  exportAnnotatedPdf,
  isLoading,
  annotations,
  clearAll,
  selectedColor,
  setSelectedColor,
  onSave,
  exportableAnnotationsExist,
  sidebarVisible,
  setSidebarVisible,
}: {
  pdfFile: File | string | null;
  activeTool: AnnotationType | null;
  setActiveTool: (tool: AnnotationType | null) => void;
  handleUndo: () => void;
  exportAnnotatedPdf: () => void;
  isLoading: boolean;
  selectedColor: any;
  setSelectedColor: any;
  annotations: Annotation[];
  clearAll: () => void;
  onSave: () => void;
  exportableAnnotationsExist?: boolean;
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
}) => (
  <div className="flex items-center gap-2 py-1 md:py-2 px-4 lg:px-6">
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
          annotationsExist={exportableAnnotationsExist ?? annotations.length > 0}
          clearAll={clearAll}
          onSave={onSave}
          sidebarVisible={sidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />
      </>
  </div>
);
