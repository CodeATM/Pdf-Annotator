import { Annotation, AnnotationType } from "@/lib/types";
import { useUserStore } from "@/hooks/stores/userStore";

interface AnnotationHandlersProps {
  activeTool: string | null;
  selectedColor: string;
  pageRefs: React.MutableRefObject<{ [key: number]: HTMLDivElement | null }>;
  pageViewports: { [key: number]: { width: number; height: number; rotation: number } };
  setCurrentAnnotation: (annotation: Annotation | null) => void;
  setIsDrawing: (drawing: boolean) => void;
  setSignaturePosition: (position: any) => void;
  setShowSignatureModal: (show: boolean) => void;
  setCommentDialogPos: (pos: any) => void;
  setShowCommentDialog: (show: boolean) => void;
  setCommentText: (text: string) => void;
}

export const useAnnotationHandlers = ({
  activeTool,
  selectedColor,
  pageRefs,
  pageViewports,
  setCurrentAnnotation,
  setIsDrawing,
  setSignaturePosition,
  setShowSignatureModal,
  setCommentDialogPos,
  setShowCommentDialog,
  setCommentText,
}: AnnotationHandlersProps) => {
  const { user } = useUserStore();

  const startAnnotation = (e: React.MouseEvent, pageNumber: number) => {
    if (!activeTool || !pageRefs.current[pageNumber]) return;

    const pageElement = pageRefs.current[pageNumber]!;
    const pageRect = pageElement.getBoundingClientRect();
    const viewport = pageViewports[pageNumber];
    if (!viewport) return;

    const x = ((e.clientX - pageRect.left) / pageRect.width) * viewport.width;
    const y = ((e.clientY - pageRect.top) / pageRect.height) * viewport.height;

    if (activeTool === "signature") {
      setSignaturePosition({
        x,
        y,
        pageNumber,
        pageWidth: viewport.width,
        pageHeight: viewport.height,
      });
      setShowSignatureModal(true);
      return;
    }

    if (activeTool === "comment") {
      console.log("Comment tool active, showing dialog at:", { x: e.clientX, y: e.clientY });
      setCommentDialogPos({
        screenX: e.clientX,
        screenY: e.clientY,
        x: ((e.clientX - pageRect.left) / pageRect.width) * viewport.width,
        y: ((e.clientY - pageRect.top) / pageRect.height) * viewport.height,
        pageNumber,
      });
      setShowCommentDialog(true);
      setCommentText("");
      return;
    }

    const newAnnotation: Annotation = {
      id: `ann-${Date.now()}`,
      type: activeTool as AnnotationType,
      pageNumber,
      x,
      y,
      width: 0,
      height: 0,
      color: selectedColor,
      createdBy: user ? {
        _id: user._id || user.id,
        firstName: user.firstName || user.firstname || "Unknown",
        lastName: user.lastName || user.lastname || "User",
        email: user.email,
      } : undefined,
    };

    setCurrentAnnotation(newAnnotation);
    console.log(newAnnotation);
    setIsDrawing(true);
  };

  const updateAnnotation = (e: React.MouseEvent, currentAnnotation: Annotation | null) => {
    if (!currentAnnotation || !pageRefs.current[currentAnnotation.pageNumber]) return;

    const pageElement = pageRefs.current[currentAnnotation.pageNumber]!;
    const pageRect = pageElement.getBoundingClientRect();
    const viewport = pageViewports[currentAnnotation.pageNumber];
    if (!viewport) return;

    const currentX = ((e.clientX - pageRect.left) / pageRect.width) * viewport.width;
    const currentY = ((e.clientY - pageRect.top) / pageRect.height) * viewport.height;

    const width = currentX - currentAnnotation.x;
    const height = currentY - currentAnnotation.y;

    setCurrentAnnotation({
      ...currentAnnotation,
      width,
      height,
    });
  };

  const finishAnnotation = (
    currentAnnotation: Annotation | null,
    scale: number,
    addAnnotation: (annotation: Annotation) => void,
    setIsDrawing: (drawing: boolean) => void,
    setCurrentAnnotation: (annotation: Annotation | null) => void
  ) => {
    if (!currentAnnotation) return;

    if (
      Math.abs(currentAnnotation.width) > 5 / scale &&
      Math.abs(currentAnnotation.height) > 5 / scale
    ) {
      addAnnotation(currentAnnotation);
    }

    setIsDrawing(false);
    setCurrentAnnotation(null);
  };

  return {
    startAnnotation,
    updateAnnotation,
    finishAnnotation,
  };
}; 