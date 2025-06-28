// components/PDFAnnotator.tsx
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  MutableRefObject,
} from "react";
import {
  PDFAnnotatorProps,
  Annotation,
  SignaturePosition,
  AnnotationType,
  PageViewport,
} from "@/lib/types";
import { PageRefs, SignaturePadRef } from "@/lib/types";
import { useDropzone } from "react-dropzone";
import { PDFDocument, rgb } from "pdf-lib";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Toolbar } from "../molecues/Toolbar";
import { SignatureModal } from "../molecues/SignatureModal";
import { useUserStore } from "@/lib/userStore";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Toolbar Component

const PDFAnnotator: React.FC<PDFAnnotatorProps> = ({
  maxFileSize = 10,
  onFileUpload,
}) => {
  const { user } = useUserStore();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [annotationHistory, setAnnotationHistory] = useState<Annotation[][]>(
    []
  );
  const [activeTool, setActiveTool] = useState<AnnotationType | null>(null);
  const [selectedColor, setSelectedColor] = useState("rgba(255, 235, 60, 0.5)");
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(
    null
  );
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [pageDimensions, setPageDimensions] = useState<{
    [key: number]: { width: number; height: number };
  }>({});
  const [signaturePosition, setSignaturePosition] =
    useState<SignaturePosition | null>(null);
  const [signatureSize, setSignatureSize] = useState({
    width: 200,
    height: 100,
  });
  const [scale, setScale] = useState(1);
  const [pageViewports, setPageViewports] = useState<{
    [key: number]: PageViewport;
  }>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<PageRefs>({});
  const signaturePadRef = useRef<SignaturePadRef | null>(null);

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
  }, []);

  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const fileSizeInMB = file.size / (1024 * 1024);
      if (maxFileSize && fileSizeInMB > maxFileSize) {
        setError(`File size exceeds ${maxFileSize}MB limit`);
        return;
      }

      setPdfFile(file);
      setError(null);
      if (onFileUpload) onFileUpload(file);
    },
    [maxFileSize, onFileUpload]
  );

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
        color: selectedColor, // Store current color with annotation
      };

      setAnnotations((prev) => [...prev, newAnnotation]);
      setSignaturePosition(null);
      setShowSignatureModal(false);
      setActiveTool(null);
      signaturePadRef.current.clear();
    }
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) signaturePadRef.current.clear();
  };

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
      setAnnotations((prev) => [...prev, currentAnnotation]);
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

  // Remove annotation
  const removeAnnotation = (id: string) => {
    setAnnotations(annotations.filter((ann) => ann.id !== id));
  };

  // Undo function
  const handleUndo = () => {
    if (annotations.length === 0) return;
    setAnnotationHistory((prev) => [...prev, annotations]);
    setAnnotations((prev) => prev.slice(0, -1));
  };

  // Export annotated PDF
  const exportAnnotatedPdf = async () => {
    if (!pdfFile) return;
    try {
      setIsLoading(true);
      setError(null);
      const existingPdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();

      for (const annotation of annotations) {
        const page = pages[annotation.pageNumber - 1];
        const { width, height } = page.getSize();

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
            x: annotation.x,
            y: height - annotation.y - Math.abs(annotation.height),
            width: Math.abs(annotation.width),
            height: Math.abs(annotation.height),
            color: rgb(r, g, b),
            opacity: a,
          });
        } else if (annotation.type === "underline") {
          page.drawLine({
            start: { x: annotation.x, y: height - annotation.y },
            end: {
              x: annotation.x + annotation.width,
              y: height - annotation.y,
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
              y: height - annotation.y - annotation.height,
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

  // Clear all annotations and file
  const clearAll = () => {
    setPdfFile(null);
    setAnnotations([]);
    setActiveTool(null);
    setSignatureImage(null);
    setPageDimensions({});
  };

  // Track page dimensions
  const handlePageLoadSuccess = (pageNumber: number, page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setPageViewports((prev) => ({
      ...prev,
      [pageNumber]: {
        width: viewport.width,
        height: viewport.height,
        rotation: viewport.rotation,
      },
    }));
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  // Global mouse up to finish drawing
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDrawing) finishAnnotation();
    };
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDrawing]);

  // Close signature modal
  const handleCloseModal = () => {
    setShowSignatureModal(false);
    setSignaturePosition(null);
    setActiveTool(null);
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
    <div className="h-screen bg-zinc-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <h1 className="text-xl font-semibold text-zinc-900">
            PDF Annotator {user?.email}
          </h1>
        </header>

        <Toolbar
          pdfFile={pdfFile}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          handleUndo={handleUndo}
          exportAnnotatedPdf={exportAnnotatedPdf}
          isLoading={isLoading}
          annotations={annotations}
          clearAll={clearAll}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* PDF Viewer */}
        <div
          ref={containerRef}
          className="border border-zinc-200 rounded-lg overflow-auto bg-white shadow-sm"
          style={{ height: "calc(100vh - 200px)" }}
          onMouseMove={updateAnnotation}
        >
          {pdfFile ? (
            <Document
              file={pdfFile}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<div className="text-center py-8">Loading PDF...</div>}
            >
              {Array.from(new Array(numPages), (_, index) => (
                <div
                  key={`page-${index + 1}`}
                  className="relative mb-4"
                  ref={(el) => setPageRef(index + 1, el)}
                  onMouseDown={(e) => startAnnotation(e, index + 1)}
                  onMouseMove={updateAnnotation}
                  onMouseUp={finishAnnotation}
                  onMouseLeave={finishAnnotation}
                  onTouchStart={(e) => handleTouchStart(e, index + 1)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{
                    cursor:
                      activeTool === "signature" || activeTool
                        ? "crosshair"
                        : "default",
                  }}
                >
                  <Page
                    pageNumber={index + 1}
                    scale={scale}
                    onLoadSuccess={(page) =>
                      handlePageLoadSuccess(index + 1, page)
                    }
                  />

                  {/* Current drawing annotation */}
                  {isDrawing &&
                    currentAnnotation &&
                    currentAnnotation.pageNumber === index + 1 && (
                      <div
                        className="absolute border border-transparent"
                        style={{
                          ...renderAnnotation(currentAnnotation, index + 1),
                          backgroundColor:
                            currentAnnotation.type === "highlight"
                              ? selectedColor
                              : "transparent",
                          borderBottom:
                            currentAnnotation.type === "underline"
                              ? `2px solid ${selectedColor}`
                              : "none",
                          pointerEvents: "none",
                        }}
                      />
                    )}

                  {/* Existing annotations */}
                  {annotations
                    .filter((ann) => ann.pageNumber === index + 1)
                    .map((annotation) => {
                      const style = renderAnnotation(annotation, index + 1);
                      if (annotation.type === "signature") {
                        return (
                          <div
                            key={annotation.id}
                            className="absolute"
                            style={{ ...style, pointerEvents: "none" }}
                          >
                            <img
                              src={annotation.imageData}
                              alt="Signature"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        );
                      }
                      return (
                        <div
                          key={annotation.id}
                          className="absolute border border-transparent"
                          style={{
                            ...style,
                            backgroundColor:
                              annotation.type === "highlight"
                                ? annotation.color || selectedColor
                                : "transparent",
                            borderBottom:
                              annotation.type === "underline"
                                ? `2px solid ${
                                    annotation.color || selectedColor
                                  }`
                                : "none",
                            pointerEvents: "none",
                          }}
                        />
                      );
                    })}
                </div>
              ))}
            </Document>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <svg
                className="w-16 h-16 text-gray-700 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-lg text-gray-600 mb-2">
                Drag & drop a PDF here, or click to upload
              </p>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <button className="px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-700">
                  Select PDF
                </button>
              </div>
            </div>
          )}
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

        {activeTool === "signature" && !showSignatureModal && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-white px-4 py-2 rounded-md text-sm">
            Click where you want to place your signature
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFAnnotator;
