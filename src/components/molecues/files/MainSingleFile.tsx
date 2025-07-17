"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import usePdfStore from "@/hooks/stores/usePdfStore";
import { useUserStore } from "@/hooks/stores/userStore";
import { NavToolbar } from "./SingleNav";
// import { Button } from "@/components/ui/button";
// import { ArrowLeftIcon, Share1Icon } from "@radix-ui/react-icons";
import { useRouter, useParams } from "next/navigation";
import PdfSection from "./PdfSection";
import { PageRefs, SignaturePadRef, Annotation, AnnotationType } from "@/lib/types";
import { PDFDocument, rgb } from "pdf-lib";
import { showSuccessToast, showErrorToast } from "@/utils/toasters";
import { useCreateAnnotation } from "@/hooks/apis/annotations";
import { SignatureModal } from "../SignatureModal";

const MainSingleFile = ({ data }: { data: any }) => {
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

  useEffect(() => {
    if (data.fileUrl) {
      setPdfFile(data.fileUrl);
    }
  }, [data.fileUrl, setPdfFile]);

  // Load annotations from server response
  useEffect(() => {
    if (data?.annotations && Array.isArray(data.annotations)) {
      // Convert server annotations to local annotation format
      const serverAnnotations = data.annotations.map((serverAnn: any) => {
        // Determine appropriate dimensions based on annotation type
        let width = serverAnn.width || 100;
        let height = serverAnn.height || 20;
        
        if (serverAnn.type === "comment" || serverAnn.type === "note") {
          // For text-based annotations, use smaller dimensions
          width = serverAnn.width || 150;
          height = serverAnn.height || 30;
        } else if (serverAnn.type === "highlight") {
          // For highlights, use the provided dimensions or defaults
          width = serverAnn.width || 200;
          height = serverAnn.height || 25;
        } else if (serverAnn.type === "underline") {
          // For underlines, use width but minimal height
          width = serverAnn.width || 200;
          height = serverAnn.height || 3;
        } else if (serverAnn.type === "signature") {
          // For signatures, use provided dimensions or defaults
          width = serverAnn.width || 150;
          height = serverAnn.height || 100;
        }

        const localAnnotation: Annotation = {
          id: serverAnn._id || `server-${Date.now()}-${Math.random()}`,
          type: serverAnn.type as AnnotationType,
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

      // Clear existing annotations and add server annotations as saved
      clearAll();
      addSavedAnnotations(serverAnnotations);

      console.log("Loaded annotations from server:", serverAnnotations);
    }
  }, [data?.annotations, clearAll, addSavedAnnotations]);

  // Calculate scale based on container size
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        // Calculate scale based on container width (standard PDF width is about 612 points)
        const newScale = Math.min((width - 48) / 612, 1.5); // Account for padding and set max scale
        setScale(Math.max(newScale, 0.5));
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [setScale]);

  // Annotation drawing functions
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

    const newAnnotation: Annotation = {
      id: `ann-${Date.now()}`,
      type: activeTool,
      pageNumber,
      x,
      y,
      width: 0,
      height: 0,
      color: selectedColor, // Store current color with annotation when created
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

  const updateAnnotation = (e: React.MouseEvent) => {
    if (
      !isDrawing ||
      !currentAnnotation ||
      !pageRefs.current[currentAnnotation.pageNumber]
    )
      return;

    const pageElement = pageRefs.current[currentAnnotation.pageNumber]!;
    const pageRect = pageElement.getBoundingClientRect();
    const viewport = pageViewports[currentAnnotation.pageNumber];
    if (!viewport) return;

    const currentX =
      ((e.clientX - pageRect.left) / pageRect.width) * viewport.width;
    const currentY =
      ((e.clientY - pageRect.top) / pageRect.height) * viewport.height;

    const width = currentX - currentAnnotation.x;
    const height = currentY - currentAnnotation.y;

    setCurrentAnnotation({
      ...currentAnnotation,
      width,
      height,
    });
  };

  const finishAnnotation = () => {
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

  // Touch event handlers to support mobile
  const handleTouchStart = (e: React.TouchEvent, pageNumber: number) => {
    e.preventDefault();
    // Simulate a mouse event using the first touch point
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
    } as React.MouseEvent);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    finishAnnotation();
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

  // Export annotated PDF
  const exportAnnotatedPdf = async () => {
    if (!pdfFile) return;
    try {
      setIsLoading(true);
      setError(null);

      const existingPdfBytes =
        typeof pdfFile === "string"
          ? await fetch(pdfFile).then((res) => res.arrayBuffer())
          : await pdfFile.arrayBuffer();

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();

      // Filter annotations to only include highlight, underline, and signature
      const exportableAnnotations = annotations.filter(annotation => 
        annotation.type === "highlight" || 
        annotation.type === "underline" || 
        annotation.type === "signature"
      );

      for (const annotation of exportableAnnotations) {
        const page = pages[annotation.pageNumber - 1];
        if (!page) continue;

        const { width: pageWidth, height: pageHeight } = page.getSize();

        // Normalize annotation rectangle to handle negative dimensions
        const rectX =
          annotation.width < 0 ? annotation.x + annotation.width : annotation.x;
        const rectY =
          annotation.height < 0
            ? annotation.y + annotation.height
            : annotation.y;
        const rectWidth = Math.abs(annotation.width);
        const rectHeight = Math.abs(annotation.height);

        // Parse the color from the annotation's stored color
        const colorRgba = annotation.color || "rgba(255, 235, 60, 0.5)";
        const colorMatch = colorRgba.match(
          /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
        );

        let r = 1,
          g = 1,
          b = 0,
          a = 0.4; // Default yellow with 0.4 opacity

        if (colorMatch) {
          r = parseInt(colorMatch[1]) / 255;
          g = parseInt(colorMatch[2]) / 255;
          b = parseInt(colorMatch[3]) / 255;
          a = colorMatch[4] ? parseFloat(colorMatch[4]) : 1;
        }

        if (annotation.type === "highlight") {
          page.drawRectangle({
            x: rectX,
            y: pageHeight - rectY - rectHeight,
            width: rectWidth,
            height: rectHeight,
            color: rgb(r, g, b),
            opacity: a,
          });
        } else if (annotation.type === "underline") {
          const lineY = pageHeight - (rectY + rectHeight);
          page.drawLine({
            start: { x: rectX, y: lineY },
            end: {
              x: rectX + rectWidth,
              y: lineY,
            },
            thickness: 2,
            color: rgb(r, g, b),
            opacity: a,
          });
        } else if (annotation.type === "signature" && annotation.imageData) {
          try {
            const signatureBytes = await fetch(annotation.imageData).then(
              (res) => res.arrayBuffer()
            );
            const signatureImage = await pdfDoc.embedPng(signatureBytes);
            page.drawImage(signatureImage, {
              x: annotation.x,
              y: pageHeight - annotation.y - annotation.height,
              width: annotation.width,
              height: annotation.height,
            });
          } catch (error) {
            console.error("Error embedding signature:", error);
          }
        }
      }

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "annotated-document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsLoading(false);
      
      // Show success message
      showSuccessToast({
        message: "PDF Exported Successfully",
        description: `Exported PDF with ${exportableAnnotations.length} annotations`,
      });
    } catch (err) {
      console.error("Error exporting PDF:", err);
      setError("Error exporting PDF. Please try again.");
      setIsLoading(false);
      
      showErrorToast({
        message: "Export Failed",
        description: "Failed to export PDF. Please try again.",
      });
    }
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
      if (isDrawing) finishAnnotation();
    };
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDrawing, finishAnnotation]);

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
          // Mark the annotations as saved after successful save
          // Get the IDs of annotations that were just saved
          const savedAnnotationIds = annotationData.annotations.map(ann => {
            // Find the corresponding local annotation by matching properties
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

  // Updated renderAnnotation with overflow prevention
  const renderAnnotation = (
    annotation: Annotation,
    pageNumber: number
  ): React.CSSProperties => {
    const viewport = pageViewports[pageNumber];
    const pageElement = pageRefs.current[pageNumber];
    if (!viewport || !pageElement) return {};

    const pageRect = pageElement.getBoundingClientRect();
    const scaleX = pageRect.width / viewport.width;
    const scaleY = pageRect.height / viewport.height;

    let left, top, width, height;
    if (annotation.type === "signature") {
      left = annotation.x * scaleX;
      top = annotation.y * scaleY;
      width = annotation.width * scaleX;
      height = annotation.height * scaleY;
    } else {
      left =
        (annotation.width < 0
          ? annotation.x + annotation.width
          : annotation.x) * scaleX;
      top =
        (annotation.height < 0
          ? annotation.y + annotation.height
          : annotation.y) * scaleY;
      width = Math.abs(annotation.width) * scaleX;
      height = Math.abs(annotation.height) * scaleY;
    }

    // Constrain annotations within the page container
    left = Math.max(0, Math.min(left, pageRect.width - width));
    top = Math.max(0, Math.min(top, pageRect.height - height));

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
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
            pdfFile={data.fileUrl}
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
            pdfFile={data.fileUrl}
            numPages={numPages}
            setNumPages={setNumPages}
            scale={scale}
            activeTool={activeTool}
            isDrawing={isDrawing}
            currentAnnotation={currentAnnotation}
            selectedColor={selectedColor}
            annotations={annotations}
            finishAnnotation={finishAnnotation}
            handlePageLoadSuccess={handlePageLoadSuccess}
            handleTouchEnd={handleTouchEnd}
            handleTouchMove={handleTouchMove}
            handleTouchStart={handleTouchStart}
            renderAnnotation={renderAnnotation}
            setPageRef={setPageRef}
            startAnnotation={startAnnotation}
            updateAnnotation={updateAnnotation}
          />
        </div>
      </div>
      
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
