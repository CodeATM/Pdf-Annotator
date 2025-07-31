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
import { useAddComment, useAddReply } from "@/hooks/apis/comments";
import { SignatureModal } from "../SignatureModal";
import { CommentDropdown } from "./CommentDropdown";
import { useAnnotationHandlers } from "./AnnotationHandlers";
import { usePdfExportHandler } from "./PdfExportHandler";
import { useAnnotationRenderer } from "./AnnotationRenderer";
import { AnnotationType } from "@/lib/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Helper to calculate text dimensions
const getTextDimensions = (text: string, font = "14px Arial") => {
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (context) {
      context.font = font;
      const metrics = context.measureText(text);
      return { width: metrics.width, height: parseInt(context.font, 10) };
    }
  }
  // Fallback for server-side rendering or environments without DOM
  return { width: text.length * 8, height: 16 };
};

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
  const { loading: commentLoading, onAddComment } = useAddComment();
  const { loading: replyLoading, onAddReply } = useAddReply();

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<PageRefs>({});
  const signaturePadRef = useRef<SignaturePadRef | null>(null);

  const [showCommentDropdown, setShowCommentDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    x: number; 
    y: number;
    containerLeft: number;
    containerRight: number;
    containerTop: number;
    containerBottom: number;
    viewportWidth?: number;
    viewportHeight?: number;
    pageRect?: DOMRect;
  } | null>(null);
  const [activeComment, setActiveComment] = useState<Annotation | null>(null);
  const [isNewComment, setIsNewComment] = useState(false);
  const [comments, setComments] = useState<any[]>([]);

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
    setCommentDialogPos: () => {}, // No longer needed
    setShowCommentDialog: () => {}, // No longer needed
    setCommentText: () => {}, // No longer needed
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

  // Custom render function for comments to show message icons
  const renderCommentIcon = (annotation: Annotation, pageNumber: number) => {
    const viewport = pageViewports[pageNumber];
    const pageElement = pageRefs.current[pageNumber];
    if (!viewport || !pageElement) return {};

    const pageRect = pageElement.getBoundingClientRect();
    const scaleX = pageRect.width / viewport.width;
    const scaleY = pageRect.height / viewport.height;

    const left = annotation.x * scaleX;
    const top = annotation.y * scaleY;

    return {
      left: `${left}px`,
      top: `${top}px`,
    };
  };

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
        
        if (serverAnn.type === "highlight") {
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

  // Load comments separately from server response
  useEffect(() => {
    console.log("Loading comments from displayData:", displayData?.comments);
    if (displayData?.comments && Array.isArray(displayData.comments)) {
      console.log("Setting comments:", displayData.comments);
      setComments(displayData.comments);
    }
  }, [displayData?.comments]);

  // Debug annotations
  useEffect(() => {
    console.log("displayData:", displayData);
    console.log("displayData.comments:", displayData?.comments);
    console.log("Current annotations:", annotations);
  }, [annotations, displayData]);

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
    startAnnotation(
      {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      } as React.MouseEvent,
      pageNumber
    );
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    updateAnnotation({
      clientX: e.touches[0].clientX,
      clientY: e.touches[0].clientY,
    } as React.MouseEvent, currentAnnotation);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
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

  // Handle new comment creation
  const handleNewComment = async (commentContent: string) => {
    if (!dropdownPosition || !params.fileId) return;

    console.log("Creating new comment at position:", dropdownPosition);

    const { width, height } = getTextDimensions(commentContent);
    const commentBoxWidth = width + 20;
    const commentBoxHeight = height + 20;
    
    // Find which page was clicked by checking all pages
    let targetPage = 1;
    let pageElement = null;
    
    for (let pageNum = 1; pageNum <= (numPages || 1); pageNum++) {
      const element = pageRefs.current[pageNum];
      if (element) {
        const rect = element.getBoundingClientRect();
        console.log(`Page ${pageNum} rect:`, rect);
        if (dropdownPosition.x >= rect.left && dropdownPosition.x <= rect.right &&
            dropdownPosition.y >= rect.top && dropdownPosition.y <= rect.bottom) {
          targetPage = pageNum;
          pageElement = element;
          console.log(`Found target page: ${targetPage}`);
          break;
        }
      }
    }
    
    if (pageElement) {
      const pageRect = pageElement.getBoundingClientRect();
      const viewport = pageViewports[targetPage] || { width: 612, height: 792 };
      
      console.log("Page rect:", pageRect);
      console.log("Viewport:", viewport);
      
      // Use exact click coordinates without adjustment
      const x = ((dropdownPosition.x - pageRect.left) / pageRect.width) * viewport.width;
      const y = ((dropdownPosition.y - pageRect.top) / pageRect.height) * viewport.height;
      
      console.log("Exact click coordinates:", { x, y });

      const newAnnotation: Annotation = {
        id: `ann-${Date.now()}`,
        type: "comment",
        pageNumber: targetPage,
        x: x,
        y: y,
        width: commentBoxWidth,
        height: commentBoxHeight,
        color: "rgba(255, 235, 60, 0.8)",
        content: commentContent,
        createdBy: user ? {
          _id: user._id || user.id,
          firstName: user.firstName || user.firstname || "Unknown",
          lastName: user.lastName || user.lastname || "User",
          email: user.email,
        } : undefined,
      };

      // Add annotation to local state first
      addAnnotation(newAnnotation);
      console.log("Added annotation:", newAnnotation);

      // Save comment to backend
      try {
        const response = await onAddComment({
          fileId: params.fileId,
          payload: {
            content: commentContent,
            position: {
              x: x,
              y: y,
              pageNumber: targetPage,
            },
            type: "comment",
            width: commentBoxWidth,
            height: commentBoxHeight,
            color: "rgba(255, 235, 60, 0.8)",
          },
          successCallback: (responseData) => {
            console.log("Comment saved to backend successfully", responseData);
            
            // Update the annotation with the real comment ID from the response
            if (responseData?.data?.commentId) {
              const updatedAnnotation = {
                ...newAnnotation,
                id: responseData.data.commentId, // Use the commentId as the main ID
                commentId: responseData.data.commentId, // Also store the commentId
              };
              
              // Replace the annotation in the store with the real ID
              removeAnnotation(newAnnotation.id);
              addAnnotation(updatedAnnotation);
              
              console.log("Updated annotation with real comment ID:", updatedAnnotation);
            }
          },
          errorCallback: (error) => {
            console.error("Failed to save comment to backend:", error);
            showErrorToast({
              message: "Error",
              description: "Failed to save comment to server",
            });
          },
        });
      } catch (error) {
        console.error("Error saving comment:", error);
      }
    }
  };

  // Handle reply to existing comment
  const handleReplySubmit = async (replyContent: string) => {
    if (!activeComment || !params.fileId) return;

    console.log("Reply submitted:", replyContent, "to comment:", activeComment);

    try {
      await onAddReply({
        fileId: params.fileId,
        payload: {
          content: replyContent,
          parentId: activeComment.commentId || activeComment.id,
        },
        successCallback: (responseData) => {
          console.log("Reply saved to backend successfully", responseData);
          
          // Keep the dropdown open and let the CommentDropdown handle the UI update
          // The dropdown will refetch the comment data to show the new reply
        },
        errorCallback: (error) => {
          console.error("Failed to save reply to backend:", error);
          showErrorToast({
            message: "Error",
            description: "Failed to save reply to server",
          });
        },
      });
    } catch (error) {
      console.error("Error saving reply:", error);
    }
  };

  // Handle comment click for existing comments
  const handleCommentClick = (comment: any) => {
    console.log("Comment clicked:", comment);
    setActiveComment(comment);
    setIsNewComment(false);
    
    // Calculate screen position for the dropdown
    const pageElement = pageRefs.current[comment.pageNumber];
    if (pageElement) {
      const pageRect = pageElement.getBoundingClientRect();
      const viewport = pageViewports[comment.pageNumber];
      if (viewport) {
        // Handle both position object and direct x/y coordinates
        let screenX, screenY;
        
        if (comment.position && comment.position.x !== undefined && comment.position.y !== undefined) {
          // Use position object
          screenX = pageRect.left + (comment.position.x / viewport.width) * pageRect.width;
          screenY = pageRect.top + (comment.position.y / viewport.height) * pageRect.height;
        } else if (comment.x !== undefined && comment.y !== undefined) {
          // Use direct x/y coordinates
          screenX = pageRect.left + (comment.x / viewport.width) * pageRect.width;
          screenY = pageRect.top + (comment.y / viewport.height) * pageRect.height;
        } else {
          // Fallback to center of page
          screenX = pageRect.left + pageRect.width / 2;
          screenY = pageRect.top + pageRect.height / 2;
        }
        
        // Get PDF container boundaries
        const pdfContainer = containerRef.current;
        const containerRect = pdfContainer?.getBoundingClientRect();
        
        setDropdownPosition({ 
          x: screenX, 
          y: screenY,
          containerLeft: containerRect?.left || 0,
          containerRight: containerRect?.right || window.innerWidth,
          containerTop: containerRect?.top || 0,
          containerBottom: containerRect?.bottom || window.innerHeight,
          viewportWidth: viewport.width,
          viewportHeight: viewport.height,
          pageRect: pageRect,
        });
        setShowCommentDropdown(true);
      }
    }
  };

  // Handle new comment tool click
  const handleNewCommentClick = (e: any) => {
    if (activeTool === "comment") {
      setIsNewComment(true);
      setActiveComment(null);
      
      // Get the page element and its position
      const pageElement = e.pageElement;
      const pageRect = pageElement.getBoundingClientRect();
      const pageNumber = e.pageNumber;
      
      // Get PDF container boundaries
      const pdfContainer = containerRef.current;
      const containerRect = pdfContainer?.getBoundingClientRect();
      
      // Get viewport dimensions for better positioning
      const viewport = pageViewports[pageNumber] || { width: 612, height: 792 };
      
      setDropdownPosition({ 
        x: e.clientX, 
        y: e.clientY,
        containerLeft: containerRect?.left || 0,
        containerRight: containerRect?.right || window.innerWidth,
        containerTop: containerRect?.top || 0,
        containerBottom: containerRect?.bottom || window.innerHeight,
        viewportWidth: viewport.width,
        viewportHeight: viewport.height,
        pageRect: pageRect,
      });
      setShowCommentDropdown(true);
    }
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
            isLoading={isLoading || saveLoading || commentLoading}
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
            comments={comments}
            finishAnnotation={() => finishAnnotation(currentAnnotation, scale, addAnnotation, setIsDrawing, setCurrentAnnotation)}
            handlePageLoadSuccess={handlePageLoadSuccess}
            handleTouchEnd={handleTouchEnd}
            handleTouchMove={handleTouchMove}
            handleTouchStart={handleTouchStart}
            renderAnnotation={renderAnnotation}
            setPageRef={setPageRef}
            startAnnotation={startAnnotation}
            updateAnnotation={(e) => updateAnnotation(e, currentAnnotation)}
            onCommentClick={handleCommentClick}
            onNewCommentClick={handleNewCommentClick}
            pageViewports={pageViewports}
            pageRefs={pageRefs}
          />
        </div>
      </div>
      {/* Unified Comment Dropdown */}
      {showCommentDropdown && dropdownPosition && (
        <CommentDropdown
          open={showCommentDropdown}
          onOpenChange={setShowCommentDropdown}
          position={dropdownPosition}
          comment={activeComment}
          onSendReply={handleReplySubmit}
          onSendNewComment={handleNewComment}
          isNewComment={isNewComment}
        />
      )}
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
