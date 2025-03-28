// components/PDFAnnotator.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument, rgb } from "pdf-lib";
import { Document, Page, pdfjs } from "react-pdf";
import SignaturePad from "react-signature-pad-wrapper";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import {
  Pencil1Icon,
  CopyIcon,
  StrikethroughIcon,
  ResetIcon,
  DownloadIcon,
  Cross2Icon,
  FileIcon,
} from "@radix-ui/react-icons";
import { MutableRefObject } from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type AnnotationType = "highlight" | "underline" | "signature";

interface Annotation {
  id: string;
  type: AnnotationType;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  imageData?: string;
  textContent?: string;
}

interface SignaturePosition {
  x: number;
  y: number;
  pageNumber: number;
  pageWidth: number;
  pageHeight: number;
}

interface PageViewport {
  width: number;
  height: number;
  rotation: number;
}

interface SignaturePadRef extends SignaturePad {
  clear: () => void;
  toDataURL: () => string;
}

interface PageRefs {
  [key: number]: HTMLDivElement | null;
}

interface SignatureModalProps {
  showSignatureModal: boolean;
  handleCloseModal: () => void;
  signaturePadRef: MutableRefObject<SignaturePadRef | null>;
  signatureSize: { width: number; height: number };
  setSignatureSize: (size: { width: number; height: number }) => void;
  handleClearSignature: () => void;
  handleSaveSignature: () => void;
}

interface PDFAnnotatorProps {
  maxFileSize?: number; // Optional prop for file size limit in MB
  onFileUpload?: (file: File) => void; // Optional callback for file upload
}

// Toolbar Component
const Toolbar = ({ 
  pdfFile,
  activeTool,
  setActiveTool,
  handleUndo,
  exportAnnotatedPdf,
  isLoading,
  annotations,
  clearAll,
  getRootProps,
  getInputProps 
}: {
  pdfFile: File | null;
  activeTool: AnnotationType | null;
  setActiveTool: (tool: AnnotationType | null) => void;
  handleUndo: () => void;
  exportAnnotatedPdf: () => void;
  isLoading: boolean;
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
        <AnnotationTools activeTool={activeTool} setActiveTool={setActiveTool} handleUndo={handleUndo} annotationsExist={annotations.length > 0} />
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

// Annotation Tools Component
const AnnotationTools = ({ 
  activeTool, 
  setActiveTool, 
  handleUndo, 
  annotationsExist 
}: {
  activeTool: AnnotationType | null;
  setActiveTool: (tool: AnnotationType | null) => void;
  handleUndo: () => void;
  annotationsExist: boolean;
}) => (
  <div className="flex items-center gap-1">
    <button
      className={`p-1.5 sm:p-2 rounded-md transition-colors ${
        activeTool === "highlight"
          ? "bg-yellow-100 text-yellow-700"
          : "hover:bg-zinc-100 text-zinc-700"
      }`}
      onClick={() => setActiveTool("highlight")}
      title="Highlight"
    >
      <CopyIcon className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
    <button
      className={`p-2 rounded-md transition-colors ${
        activeTool === "underline"
          ? "bg-blue-100 text-blue-700"
          : "hover:bg-zinc-100 text-zinc-700"
      }`}
      onClick={() => setActiveTool("underline")}
      title="Underline"
    >
      <StrikethroughIcon className="w-5 h-5" />
    </button>
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

// Action Buttons Component
const ActionButtons = ({ 
  activeTool,
  setActiveTool,
  exportAnnotatedPdf,
  isLoading,
  annotationsExist,
  clearAll
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
      className="flex items-center gap-2 px-3 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50"
      onClick={exportAnnotatedPdf}
      disabled={isLoading || !annotationsExist}
    >
      <DownloadIcon className="w-5 h-5" />
      {isLoading ? "Exporting..." : "Export"}
    </button>
    <button
      className="p-2 rounded-md hover:bg-red-100 text-red-600 transition-colors"
      onClick={clearAll}
      title="Clear All"
    >
      <ResetIcon className="w-5 h-5" />
    </button>
  </div>
);

// Signature Modal Component
const SignatureModal = ({
  showSignatureModal,
  handleCloseModal,
  signaturePadRef,
  signatureSize,
  setSignatureSize,
  handleClearSignature,
  handleSaveSignature
}: SignatureModalProps) => (
  showSignatureModal && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[90vw] sm:max-w-md p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-zinc-900">Draw Signature</h2>
          <button onClick={handleCloseModal} className="text-zinc-500 hover:text-zinc-700">
            <Cross2Icon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="border border-zinc-200 rounded-md overflow-hidden">
          <SignaturePad
            ref={signaturePadRef}
            options={{
              minWidth: 1,
              maxWidth: 3,
              penColor: 'black',
              backgroundColor: 'rgb(255, 255, 255)'
            }}
            canvasProps={{
              width: "400",
              height: "200",
              className: 'w-full h-[150px] sm:h-[200px]'
            }}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-600">Signature Size</label>
          <div className="flex gap-4">
            <input
              type="range"
              min="100"
              max="400"
              value={signatureSize.width}
              onChange={(e) => setSignatureSize({
                width: Number(e.target.value),
                height: Number(e.target.value) / 2
              })}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-zinc-600 hover:text-zinc-900"
            onClick={handleClearSignature}
          >
            Clear
          </button>
          <button
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-zinc-900 text-white text-xs sm:text-sm rounded-md hover:bg-zinc-800"
            onClick={handleSaveSignature}
          >
            Add Signature
          </button>
        </div>
      </div>
    </div>
  )
);

const PDFAnnotator: React.FC<PDFAnnotatorProps> = ({ maxFileSize = 10, onFileUpload }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [annotationHistory, setAnnotationHistory] = useState<Annotation[][]>(
    []
  );
  const [activeTool, setActiveTool] = useState<AnnotationType | null>(null);
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
  const [signaturePosition, setSignaturePosition] = useState<SignaturePosition | null>(null);
  const [signatureSize, setSignatureSize] = useState({ width: 200, height: 100 });
  const [scale, setScale] = useState(1);
  const [pageViewports, setPageViewports] = useState<{ [key: number]: PageViewport }>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<PageRefs>({});
  const signaturePadRef = useRef<SignaturePadRef | null>(null);

  // Add useEffect for scale calculation
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        // Calculate scale based on container width
        // Assuming standard PDF width is 612 points (8.5 inches)
        const newScale = Math.min((width - 48) / 612, 1.5); // 48px for padding, max scale 1.5
        setScale(Math.max(newScale, 0.5)); // minimum scale 0.5
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (maxFileSize && fileSizeInMB > maxFileSize) {
      setError(`File size exceeds ${maxFileSize}MB limit`);
      return;
    }

    setPdfFile(file);
    setError(null);
    
    // Call the onFileUpload callback if provided
    if (onFileUpload) {
      onFileUpload(file);
    }
  }, [maxFileSize, onFileUpload]);

  // Signature functions
  const handleSaveSignature = () => {
    if (signaturePadRef.current && signaturePosition) {
      const signatureDataUrl = signaturePadRef.current.toDataURL();
      const viewport = pageViewports[signaturePosition.pageNumber];
      
      if (!viewport) return;

      const newAnnotation: Annotation = {
        id: `ann-${Date.now()}`,
        type: 'signature',
        pageNumber: signaturePosition.pageNumber,
        x: signaturePosition.x,
        y: signaturePosition.y,
        width: (signatureSize.width / scale) * (viewport.width / signaturePosition.pageWidth),
        height: (signatureSize.height / scale) * (viewport.height / signaturePosition.pageHeight),
        imageData: signatureDataUrl,
      };

      setAnnotations(prev => [...prev, newAnnotation]);
      setSignaturePosition(null);
      setShowSignatureModal(false);
      setActiveTool(null);
      signaturePadRef.current.clear();
    }
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  // Annotation drawing functions
  const startAnnotation = (e: React.MouseEvent, pageNumber: number) => {
    if (!activeTool || !pageRefs.current[pageNumber]) return;

    const pageElement = pageRefs.current[pageNumber]!;
    const pageRect = pageElement.getBoundingClientRect();
    const viewport = pageViewports[pageNumber];
    
    if (!viewport) return;

    // Convert screen coordinates to PDF coordinates
    const x = (e.clientX - pageRect.left) / pageRect.width * viewport.width;
    const y = (e.clientY - pageRect.top) / pageRect.height * viewport.height;

    if (activeTool === 'signature') {
      setSignaturePosition({
        x,
        y,
        pageNumber,
        pageWidth: viewport.width,
        pageHeight: viewport.height
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
      color: activeTool === 'highlight' ? 'rgba(255, 255, 0, 0.4)' : 'blue',
    };

    setCurrentAnnotation(newAnnotation);
    setIsDrawing(true);
  };

  const updateAnnotation = (e: React.MouseEvent) => {
    if (!isDrawing || !currentAnnotation || !pageRefs.current[currentAnnotation.pageNumber]) return;

    const pageElement = pageRefs.current[currentAnnotation.pageNumber]!;
    const pageRect = pageElement.getBoundingClientRect();
    const viewport = pageViewports[currentAnnotation.pageNumber];
    
    if (!viewport) return;

    const currentX = (e.clientX - pageRect.left) / pageRect.width * viewport.width;
    const currentY = (e.clientY - pageRect.top) / pageRect.height * viewport.height;

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

    // Save annotation if it has a minimum size
    if (Math.abs(currentAnnotation.width) > 5 / scale && Math.abs(currentAnnotation.height) > 5 / scale) {
      setAnnotations(prev => [...prev, currentAnnotation]);
    }

    setIsDrawing(false);
    setCurrentAnnotation(null);
  };

  // Remove annotation
  const removeAnnotation = (id: string) => {
    setAnnotations(annotations.filter((ann) => ann.id !== id));
  };

  // Add undo function
  const handleUndo = () => {
    if (annotations.length === 0) return;

    // Save current state to history
    setAnnotationHistory((prev) => [...prev, annotations]);
    // Remove last annotation
    setAnnotations((prev) => prev.slice(0, -1));
  };

  // Export annotated PDF
  const exportAnnotatedPdf = async () => {
    if (!pdfFile) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load the PDF document
      const existingPdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();

      // Process annotations page by page
      for (const annotation of annotations) {
        const page = pages[annotation.pageNumber - 1];
        const { width, height } = page.getSize();

        if (annotation.type === 'highlight') {
          // Add highlight annotation
          page.drawRectangle({
            x: annotation.x,
            y: height - annotation.y - Math.abs(annotation.height), // Flip Y coordinate
            width: Math.abs(annotation.width),
            height: Math.abs(annotation.height),
            color: rgb(1, 1, 0), // Yellow
            opacity: 0.4,
          });
        } else if (annotation.type === 'underline') {
          // Add underline annotation
          page.drawLine({
            start: { x: annotation.x, y: height - annotation.y },
            end: { x: annotation.x + annotation.width, y: height - annotation.y },
            thickness: 2,
            color: rgb(0, 0, 1), // Blue
          });
        } else if (annotation.type === 'signature' && annotation.imageData) {
          // Handle signature
          try {
            // Convert base64 signature to bytes
            const signatureBytes = await fetch(annotation.imageData).then(res => res.arrayBuffer());
            const signatureImage = await pdfDoc.embedPng(signatureBytes);
            
            page.drawImage(signatureImage, {
              x: annotation.x,
              y: height - annotation.y - annotation.height, // Flip Y coordinate
              width: annotation.width,
              height: annotation.height,
            });
          } catch (error) {
            console.error('Error embedding signature:', error);
          }
        }
      }

      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = 'annotated-document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsLoading(false);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError('Error exporting PDF. Please try again.');
      setIsLoading(false);
    }
  };

  // Clear all
  const clearAll = () => {
    setPdfFile(null);
    setAnnotations([]);
    setActiveTool(null);
    setSignatureImage(null);
    setPageDimensions({});
  };

  // Track page dimensions
  const handlePageLoadSuccess = (pageNumber: number, page: any) => {
    const viewport = page.getViewport({ scale: 1 }); // Get viewport at scale 1
    setPageViewports(prev => ({
      ...prev,
      [pageNumber]: {
        width: viewport.width,
        height: viewport.height,
        rotation: viewport.rotation
      }
    }));
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  // Handle mouse up outside the component
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDrawing) {
        finishAnnotation();
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDrawing]);

  // Close modal handler
  const handleCloseModal = () => {
    setShowSignatureModal(false);
    setSignaturePosition(null);
    setActiveTool(null);
  };

  // Update the annotation rendering to use percentages
  const renderAnnotation = (annotation: Annotation, pageNumber: number): React.CSSProperties => {
    const viewport = pageViewports[pageNumber];
    const pageElement = pageRefs.current[pageNumber];
    
    if (!viewport || !pageElement) return {};

    const pageRect = pageElement.getBoundingClientRect();
    const scaleX = pageRect.width / viewport.width;
    const scaleY = pageRect.height / viewport.height;

    if (annotation.type === 'signature') {
      return {
        left: `${annotation.x * scaleX}px`,
        top: `${annotation.y * scaleY}px`,
        width: `${annotation.width * scaleX}px`,
        height: `${annotation.height * scaleY}px`,
      };
    }

    return {
      left: `${(annotation.width < 0 ? annotation.x + annotation.width : annotation.x) * scaleX}px`,
      top: `${(annotation.height < 0 ? annotation.y + annotation.height : annotation.y) * scaleY}px`,
      width: `${Math.abs(annotation.width) * scaleX}px`,
      height: `${Math.abs(annotation.height) * scaleY}px`,
    };
  };

  // Update page ref handling
  const setPageRef = useCallback((index: number, element: HTMLDivElement | null) => {
    pageRefs.current[index] = element;
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <h1 className="text-xl font-semibold text-zinc-900">PDF Annotator</h1>
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
          style={{ height: 'calc(100vh - 200px)' }}
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
                  style={{ 
                    cursor: activeTool === 'signature' 
                      ? 'crosshair' 
                      : activeTool 
                        ? 'crosshair' 
                        : 'default' 
                  }}
                >
                  <Page
                    pageNumber={index + 1}
                    scale={scale}
                    onLoadSuccess={(page) => handlePageLoadSuccess(index + 1, page)}
                  />

                  {/* Render current drawing annotation */}
                  {isDrawing && currentAnnotation && currentAnnotation.pageNumber === index + 1 && (
                    <div
                      className="absolute border border-transparent"
                      style={{
                        ...renderAnnotation(currentAnnotation, index + 1),
                        backgroundColor: currentAnnotation.type === 'highlight' 
                          ? 'rgba(255, 255, 0, 0.4)' 
                          : 'transparent',
                        borderBottom: currentAnnotation.type === 'underline' 
                          ? '2px solid blue' 
                          : 'none',
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  {/* Render existing annotations */}
                  {annotations
                    .filter((ann) => ann.pageNumber === index + 1)
                    .map((annotation) => {
                      const style = renderAnnotation(annotation, index + 1);

                      if (annotation.type === 'signature') {
                        return (
                          <div
                            key={annotation.id}
                            className="absolute"
                            style={{
                              ...style,
                              pointerEvents: 'none',
                            } as React.CSSProperties}
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
                            backgroundColor: annotation.type === 'highlight' 
                              ? 'rgba(255, 255, 0, 0.4)' 
                              : 'transparent',
                            borderBottom: annotation.type === 'underline' 
                              ? '2px solid blue' 
                              : 'none',
                            pointerEvents: 'none',
                          } as React.CSSProperties}
                        />
                      );
                    })}
                </div>
              ))}
            </Document>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mb-4"
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
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Select PDF
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Updated Signature Modal */}
        <SignatureModal
          showSignatureModal={showSignatureModal}
          handleCloseModal={handleCloseModal}
          signaturePadRef={signaturePadRef}
          signatureSize={signatureSize}
          setSignatureSize={setSignatureSize}
          handleClearSignature={handleClearSignature}
          handleSaveSignature={handleSaveSignature}
        />

        {activeTool === 'signature' && !showSignatureModal && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-white px-4 py-2 rounded-md text-sm">
            Click where you want to place your signature
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFAnnotator;
