// src/hooks/stores/usePdfStore.tsx
import { create } from "zustand";
import { Annotation, AnnotationType, PageViewport } from "@/lib/types";

// State for the PDF viewer and annotator
interface PdfStoreState {
  pdfFile: File | string | null;
  numPages: number | null;
  annotations: Annotation[];
  activeTool: AnnotationType | null;
  selectedColor: string;
  error: string | null;
  isLoading: boolean;
  isDrawing: boolean;
  currentAnnotation: Annotation | null;
  showSignatureModal: boolean;
  signaturePosition: {
    x: number;
    y: number;
    pageNumber: number;
    pageWidth: number;
    pageHeight: number;
  } | null;
  signatureSize: { width: number; height: number };
  scale: number;
  pageViewports: { [key: number]: PageViewport };
  setPdfFile: (file: File | string | null) => void;
  setNumPages: (pages: number) => void;
  addAnnotation: (annotation: Annotation) => void;
  handleUndo: () => void;
  removeAnnotation: (id: string) => void;
  clearAll: () => void;
  setActiveTool: (tool: AnnotationType | null) => void;
  setSelectedColor: (color: string) => void;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsDrawing: (drawing: boolean) => void;
  setCurrentAnnotation: (annotation: Annotation | null) => void;
  setShowSignatureModal: (show: boolean) => void;
  setSignaturePosition: (
    position: {
      x: number;
      y: number;
      pageNumber: number;
      pageWidth: number;
      pageHeight: number;
    } | null
  ) => void;
  setSignatureSize: (size: { width: number; height: number }) => void;
  setScale: (scale: number) => void;
  setPageViewports: (pageNumber: number, viewport: PageViewport) => void;
}

const usePdfStore = create<PdfStoreState>((set, get) => ({
  pdfFile: null,
  numPages: null,
  annotations: [],
  activeTool: null,
  selectedColor: "rgba(255, 235, 60, 0.5)", // Default highlight color (yellow)
  error: null,
  isLoading: false,
  isDrawing: false,
  currentAnnotation: null,
  showSignatureModal: false,
  signaturePosition: null,
  signatureSize: { width: 300, height: 150 },
  scale: 1.0,
  pageViewports: {},

  // Set the PDF file and reset related state
  setPdfFile: (file) =>
    set({
      pdfFile: file,
      annotations: [],
      numPages: null,
      pageViewports: {},
      error: null,
      isLoading: false,
    }),

  // Set the total number of pages
  setNumPages: (pages) => set({ numPages: pages }),

  // Add an annotation to the list
  addAnnotation: (annotation) =>
    set((state) => ({ annotations: [...state.annotations, annotation] })),

  // Undo the last annotation
  handleUndo: () =>
    set((state) => ({
      annotations: state.annotations.slice(0, -1),
    })),

  // Remove a specific annotation by its ID
  removeAnnotation: (id) =>
    set((state) => ({
      annotations: state.annotations.filter((ann) => ann.id !== id),
    })),

  // Clear all annotations
  clearAll: () => set({ annotations: [] }),

  // Set the active annotation tool
  setActiveTool: (tool) => set({ activeTool: tool }),

  // Set the selected color
  setSelectedColor: (color) => set({ selectedColor: color }),

  // Set an error message
  setError: (error) => set({ error: error }),

  // Set loading state
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Set drawing state
  setIsDrawing: (drawing) => set({ isDrawing: drawing }),

  // Set the current annotation being drawn
  setCurrentAnnotation: (annotation) => set({ currentAnnotation: annotation }),

  // Show or hide the signature modal
  setShowSignatureModal: (show) => set({ showSignatureModal: show }),

  // Set the position for the signature
  setSignaturePosition: (position) => set({ signaturePosition: position }),

  // Set the size of the signature pad
  setSignatureSize: (size) => set({ signatureSize: size }),

  // Set the PDF scale
  setScale: (scale) => set({ scale: scale }),

  // Store page viewport dimensions
  setPageViewports: (pageNumber, viewport) =>
    set((state) => ({
      pageViewports: { ...state.pageViewports, [pageNumber]: viewport },
    })),
}));

export default usePdfStore;
