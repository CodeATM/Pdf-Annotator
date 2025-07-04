import { Annotation, PDFAnnotatorProps } from "@/lib/types";
import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Custom scrollbar styles
const pdfScrollStyle: React.CSSProperties = {
  scrollbarWidth: "thin",
  scrollbarColor: "#bdbdbd #f5f5f5",
};

const customScrollbar = `
  .pdf-scrollbar::-webkit-scrollbar {
    width: 7px;
    background: #f5f5f5;
  }
  .pdf-scrollbar::-webkit-scrollbar-thumb {
    background: #bdbdbd;
    border-radius: 6px;
  }
`;

type Props = {
  containerRef: React.RefObject<HTMLDivElement>;
  pdfFile: File | string | null;
  numPages: number | null;
  setNumPages: (numPages: number) => void;
  scale: number;
  activeTool: any;
  isDrawing: boolean;
  currentAnnotation: any;
  selectedColor: string;
  annotations: any[];
  finishAnnotation: () => void;
  handlePageLoadSuccess: (pageNumber: number, page: any) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchStart: (e: React.TouchEvent, pageNumber: number) => void;
  renderAnnotation: (
    annotation: Annotation,
    pageNumber: number
  ) => React.CSSProperties;
  setPageRef: (index: number, element: HTMLDivElement | null) => void;
  startAnnotation: (e: React.MouseEvent, pageNumber: number) => void;
  updateAnnotation: (e: React.MouseEvent) => void;
};

const PdfSection = (props: Props) => {
  return (
    <div
      ref={props.containerRef}
      className="relative h-full w-full overflow-hidden"
    >
      {/* Custom scrollbar style */}
      <style>{customScrollbar}</style>

      {/* Scrollable PDF container */}
      <div
        className="overflow-y-auto pdf-scrollbar flex flex-col items-center"
        style={{ height: "100%", ...pdfScrollStyle }}
        onMouseMove={props.updateAnnotation}
      >
        <div className="w-full flex flex-col items-center py-4 gap-8">
          {props.pdfFile ? (
            <Document
              file={props.pdfFile}
              onLoadSuccess={({ numPages }) => props.setNumPages(numPages)}
              loading={<div className="text-center py-8">Loading PDF...</div>}
            >
              {Array.from({ length: props.numPages || 0 }, (_, index) => (
                <div
                  key={`page-${index + 1}`}
                  className="relative mb-4 border border-gray-300 rounded-md shadow-sm bg-white p-2"
                  ref={(el) => props.setPageRef(index + 1, el)}
                  onMouseDown={(e) => props.startAnnotation(e, index + 1)}
                  onMouseMove={props.updateAnnotation}
                  onMouseUp={props.finishAnnotation}
                  onMouseLeave={props.finishAnnotation}
                  onTouchStart={(e) => props.handleTouchStart(e, index + 1)}
                  onTouchMove={props.handleTouchMove}
                  onTouchEnd={props.handleTouchEnd}
                  style={{
                    cursor:
                      props.activeTool === "signature" || props.activeTool
                        ? "crosshair"
                        : "default",
                  }}
                >
                  <Page
                    pageNumber={index + 1}
                    scale={props.scale}
                    onLoadSuccess={(page) =>
                      props.handlePageLoadSuccess(index + 1, page)
                    }
                  />
                  {/* Page number indicator */}
                  <div className="absolute bottom-0 left-0 right-0 text-end px-4 text-sm text-gray-500 bg-gray-100 py-1 rounded-b-md">
                    Page {index + 1}
                  </div>

                  {/* Current drawing annotation */}
                  {props.isDrawing &&
                    props.currentAnnotation &&
                    props.currentAnnotation.pageNumber === index + 1 && (
                      <div
                        className="absolute border border-transparent"
                        style={{
                          ...props.renderAnnotation(
                            props.currentAnnotation,
                            index + 1
                          ),
                          backgroundColor:
                            props.currentAnnotation.type === "highlight"
                              ? props.selectedColor
                              : "transparent",
                          borderBottom:
                            props.currentAnnotation.type === "underline"
                              ? `2px solid ${props.selectedColor}`
                              : "none",
                          pointerEvents: "none",
                        }}
                      />
                    )}

                  {/* Existing annotations */}
                  {props.annotations
                    .filter((ann: any) => ann.pageNumber === index + 1)
                    .map((annotation: any) => {
                      const style = props.renderAnnotation(
                        annotation,
                        index + 1
                      );
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
                                ? annotation.color || props.selectedColor
                                : "transparent",
                            borderBottom:
                              annotation.type === "underline"
                                ? `2px solid ${
                                    annotation.color || props.selectedColor
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
                File loaded, but no view selected
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfSection;
