"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import usePdfStore from "@/hooks/stores/usePdfStore";
import { NavToolbar } from "./SingleNav";
// import { Button } from "@/components/ui/button";
// import { ArrowLeftIcon, Share1Icon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import PdfSection from "./PdfSection";
import { PageRefs, SignaturePadRef, Annotation } from "@/lib/types";
import { PDFDocument, rgb } from "pdf-lib";

const MainSingleFile = ({ data }: { data: any }) => {
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
  } = usePdfStore();

  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<PageRefs>({});
  const signaturePadRef = useRef<SignaturePadRef | null>(null);

  useEffect(() => {
    if (data.fileUrl) {
      setPdfFile(data.pdfUrl);
    }
  }, [data.fileUrl, setPdfFile]);

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

      for (const annotation of annotations) {
        const page = pages[annotation.pageNumber - 1];
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
    } catch (err) {
      console.error("Error exporting PDF:", err);
      setError("Error exporting PDF. Please try again.");
      setIsLoading(false);
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
            isLoading={isLoading}
            annotations={annotations}
            clearAll={clearAll}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
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
    </>
  );
};

export default MainSingleFile;
