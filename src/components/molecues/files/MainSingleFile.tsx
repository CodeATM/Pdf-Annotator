"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import usePdfStore from "@/hooks/stores/usePdfStore";
import { useUserStore } from "@/hooks/stores/userStore";
import { useFileMetaStore } from "@/hooks/stores/otherStore";
import { NavToolbar } from "./SingleNav";
import { useRouter, useParams } from "next/navigation";
import PdfSection from "./PdfSection";
import { PageRefs, SignaturePadRef, Annotation } from "@/lib/types";
import { showErrorToast } from "@/utils/toasters";
import { useCreateAnnotation } from "@/hooks/apis/annotations";
import { SignatureModal } from "../SignatureModal";
import { CommentDialog } from "./CommentDialog";
import { useAnnotationHandlers } from "./AnnotationHandlers";
import { usePdfExportHandler } from "./PdfExportHandler";
import { useAnnotationRenderer } from "./AnnotationRenderer";

const MainSingleFile = () => {
  const meta = useFileMetaStore();
  const displayData = meta;
  const { user } = useUserStore();
  const {
    pdfFile,
    setPdfFile,
    numPages,
    setNumPages,
    annotations,
    activeTool,
    setActiveTool,
    selectedColor,
    setSelectedColor,
    error,
    setError,
    isLoading,
    setIsLoading,
    isDrawing,
    setIsDrawing,
    currentAnnotation,
    setCurrentAnnotation,
    showSignatureModal,
    setShowSignatureModal,
    signaturePosition,
    setSignaturePosition,
    signatureSize,
    setSignatureSize,
    scale,
    setScale,
    pageViewports,
    setPageViewports,
    handleUndo,
    removeAnnotation,
    clearAll,
    addAnnotation,
    addSavedAnnotations,
    saveAnnotationsToServer,
    markAnnotationsAsSaved,
  } = usePdfStore();

  const router = useRouter();
  const params = useParams<{ fileId: string }>();
  const { loading: saveLoading, onCreateAnnotation } = useCreateAnnotation();

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<PageRefs>({});
  const signaturePadRef = useRef<SignaturePadRef | null>(null);

  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [commentDialogPos, setCommentDialogPos] = useState<{ 
    x: number; 
    y: number; 
    screenX: number; 
    screenY: number; 
    pageNumber: number; 
  } | null>(null);
  const [commentText, setCommentText] = useState("");

  // Custom hooks for modular functionality
  const { startAnnotation, updateAnnotation, finishAnnotation } = useAnnotationHandlers({
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
  });

  const { exportAnnotatedPdf } = usePdfExportHandler({
    pdfFile,
    annotations,
    setIsLoading,
    setError,
  });

  const { renderAnnotation } = useAnnotationRenderer({
    pageViewports,
    pageRefs,
  });

  useEffect(() => {
    if (displayData.fileUrl) {
      setPdfFile(displayData.fileUrl);
    }
  }, [displayData.fileUrl, setPdfFile]);

  // Load annotations from server response
  useEffect(() => {
    if (displayData?.annotations && Array.isArray(displayData.annotations)) {
      const serverAnnotations = displayData.annotations.map((serverAnn: any) => {
        let width = serverAnn.width || 100;
        let height = serverAnn.height || 20;
        
        if (serverAnn.type === "comment" || serverAnn.type === "note") {
          width = serverAnn.width || 150;
          height = serverAnn.height || 30;
        } else if (serverAnn.type === "highlight") {
          width = serverAnn.width || 200;
          height = serverAnn.height || 25;
        } else if (serverAnn.type === "underline") {
          width = serverAnn.width || 200;
          height = serverAnn.height || 3;
        } else if (serverAnn.type === "signature") {
          width = serverAnn.width || 150;
          height = serverAnn.height || 100;
        }

        const localAnnotation: Annotation = {
          id: serverAnn._id || `server-${Date.now()}-${Math.random()}`,
          type: serverAnn.type,
          pageNumber: serverAnn.pageNumber,
          x: serverAnn.position?.x || 0,
          y: serverAnn.position?.y || 0,
          width: width,
          height: height,
          color: serverAnn.color || "rgba(255, 235, 60, 0.5)",
          content: serverAnn.content,
          imageData: serverAnn.imageData,
          createdBy: serverAnn.createdBy,
        };
        return localAnnotation;
      });

      clearAll();
      addSavedAnnotations(serverAnnotations);
      console.log("Loaded annotations from server:", serverAnnotations);
    }
  }, [displayData?.annotations, clearAll, addSavedAnnotations]);

  // Calculate scale based on container size
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const newScale = Math.min((width - 48) / 612, 1.5);
        setScale(Math.max(newScale, 0.5));
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [setScale]);

  // Touch event handlers to support mobile
  const handleTouchStart = (e: React.TouchEvent, pageNumber: number) => {
    e.preventDefault();
    startAnnotation(
      {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      } as React.MouseEvent,
      pageNumber
    );
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    updateAnnotation({
      clientX: e.touches[0].clientX,
      clientY: e.touches[0].clientY,
    } as React.MouseEvent, currentAnnotation);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    finishAnnotation(currentAnnotation, scale, addAnnotation, setIsDrawing, setCurrentAnnotation);
  };

  // Signature functions
  const handleSaveSignature = () => {
    if (signaturePadRef.current && signaturePosition) {
      const signatureDataUrl = signaturePadRef.current.toDataURL();
      const viewport = pageViewports[signaturePosition.pageNumber];
      if (!viewport) return;

      const newAnnotation: Annotation = {
        id: `ann-${Date.now()}`,
        type: "signature",
        pageNumber: signaturePosition.pageNumber,
        x: signaturePosition.x,
        y: signaturePosition.y,
        width:
          (signatureSize.width / scale) *
          (viewport.width / signaturePosition.pageWidth),
        height:
          (signatureSize.height / scale) *
          (viewport.height / signaturePosition.pageHeight),
        imageData: signatureDataUrl,
        color: selectedColor,
        createdBy: user ? {
          _id: user._id || user.id,
          firstName: user.firstName || user.firstname || "Unknown",
          lastName: user.lastName || user.lastname || "User",
          email: user.email,
        } : undefined,
      };

      addAnnotation(newAnnotation);
      setSignaturePosition(null);
      setShowSignatureModal(false);
      setActiveTool(null);
      signaturePadRef.current.clear();
    }
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) signaturePadRef.current.clear();
  };

  const handleCloseModal = () => {
    setShowSignatureModal(false);
    setSignaturePosition(null);
    setActiveTool(null);
  };

  // Track page dimensions
  const handlePageLoadSuccess = (pageNumber: number, page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setPageViewports(pageNumber, {
      width: viewport.width,
      height: viewport.height,
      rotation: viewport.rotation,
    });
  };

  // Global mouse up to finish drawing
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDrawing) {
        finishAnnotation(currentAnnotation, scale, addAnnotation, setIsDrawing, setCurrentAnnotation);
      }
    };
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDrawing, currentAnnotation, scale, addAnnotation, setIsDrawing, setCurrentAnnotation, finishAnnotation]);

  // Handle save annotations
  const handleSaveAnnotations = async () => {
    if (!params.fileId) {
      showErrorToast({
        message: "Error",
        description: "File ID not found",
      });
      return;
    }

    try {
      const annotationData = await saveAnnotationsToServer(params.fileId);
      
      await onCreateAnnotation({
        payload: {
          annotations: annotationData.annotations,
        },
        successCallback: () => {
          const savedAnnotationIds = annotationData.annotations.map(ann => {
            const localAnnotation = annotations.find(localAnn => 
              localAnn.pageNumber === ann.pageNumber &&
              localAnn.x === ann.position.x &&
              localAnn.y === ann.position.y &&
              localAnn.type === ann.type
            );
            return localAnnotation?.id;
          }).filter(Boolean) as string[];
          
          if (savedAnnotationIds.length > 0) {
            markAnnotationsAsSaved(savedAnnotationIds);
          }
          
          console.log("Annotations saved successfully");
        },
      });
    } catch (error: any) {
      console.error("Failed to save annotations:", error);
      showErrorToast({
        message: "Error",
        description: error.message || "Failed to save annotations",
      });
    }
  };

  // Handle comment dialog submit
  const handleCommentSubmit = () => {
    if (!commentDialogPos || !commentText.trim()) return;

    const newAnnotation: Annotation = {
      id: `ann-${Date.now()}`,
      type: "comment",
      pageNumber: commentDialogPos.pageNumber,
      x: commentDialogPos.x,
      y: commentDialogPos.y,
      width: 150,
      height: 30,
      color: "rgba(255, 235, 60, 0.8)",
      content: commentText,
      createdBy: user ? {
        _id: user._id || user.id,
        firstName: user.firstName || user.firstname || "Unknown",
        lastName: user.lastName || user.lastname || "User",
        email: user.email,
      } : undefined,
    };
    addAnnotation(newAnnotation);
    setShowCommentDialog(false);
    setCommentDialogPos(null);
    setCommentText("");
    setActiveTool(null);
  };

  // Set page ref
  const setPageRef = useCallback(
    (index: number, element: HTMLDivElement | null) => {
      pageRefs.current[index] = element;
    },
    []
  );

  return (
    <>
      <div className="border-r-[1px] min-h-full flex-1 flex flex-col">
        {/* Sticky/fixed NavToolbar at the top */}
        <div className="z-10 sticky top-0 bg-white border-b-[1px]">
          <NavToolbar
            pdfFile={displayData.fileUrl || null}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            handleUndo={handleUndo}
            exportAnnotatedPdf={exportAnnotatedPdf}
            isLoading={isLoading || saveLoading}
            annotations={annotations}
            clearAll={clearAll}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            onSave={handleSaveAnnotations}
            exportableAnnotationsExist={annotations.some(annotation => 
              annotation.type === "highlight" || 
              annotation.type === "underline" || 
              annotation.type === "signature"
            )}
          />
        </div>
        {/* Scrollable PDF section below the toolbar */}
        <div className="flex-1 min-h-0">
          <PdfSection
            containerRef={containerRef}
            pdfFile={displayData.fileUrl || null}
            numPages={numPages}
            setNumPages={setNumPages}
            scale={scale}
            activeTool={activeTool}
            isDrawing={isDrawing}
            currentAnnotation={currentAnnotation}
            selectedColor={selectedColor}
            annotations={annotations}
            finishAnnotation={() => finishAnnotation(currentAnnotation, scale, addAnnotation, setIsDrawing, setCurrentAnnotation)}
            handlePageLoadSuccess={handlePageLoadSuccess}
            handleTouchEnd={handleTouchEnd}
            handleTouchMove={handleTouchMove}
            handleTouchStart={handleTouchStart}
            renderAnnotation={renderAnnotation}
            setPageRef={setPageRef}
            startAnnotation={startAnnotation}
            updateAnnotation={(e) => updateAnnotation(e, currentAnnotation)}
          />
        </div>
      </div>
      {/* Floating Comment Dialog */}
      <CommentDialog
        showCommentDialog={showCommentDialog}
        setShowCommentDialog={setShowCommentDialog}
        commentDialogPos={commentDialogPos}
        commentText={commentText}
        setCommentText={setCommentText}
        handleCommentSubmit={handleCommentSubmit}
        setActiveTool={setActiveTool}
        setCommentDialogPos={setCommentDialogPos}
      />
      {/* Signature Modal */}
      <SignatureModal
        showSignatureModal={showSignatureModal}
        handleCloseModal={handleCloseModal}
        signaturePadRef={signaturePadRef}
        signatureSize={signatureSize}
        setSignatureSize={setSignatureSize}
        handleClearSignature={handleClearSignature}
        handleSaveSignature={handleSaveSignature}
      />
    </>
  );
};

export default MainSingleFile;
