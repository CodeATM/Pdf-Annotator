// src/hooks/stores/usePdfStore.tsx
import { create } from "zustand";
import { Annotation, AnnotationType, PageViewport, ApiAnnotation } from "@/lib/types";

// State for the PDF viewer and annotator
interface PdfStoreState {
  pdfFile: File | string | null;
  numPages: number | null;
  annotations: Annotation[];
  savedAnnotationIds: Set<string>; // Track which annotations are already saved
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
  addSavedAnnotations: (annotations: Annotation[]) => void; // Add saved annotations from server
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
  saveAnnotationsToServer: (fileId: string) => Promise<{ annotations: ApiAnnotation[] }>;
  markAnnotationsAsSaved: (annotationIds: string[]) => void;
}

const usePdfStore = create<PdfStoreState>((set, get) => ({
  pdfFile: null,
  numPages: null,
  annotations: [],
  savedAnnotationIds: new Set(),
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

  // Add a new annotation (unsaved)
  addAnnotation: (annotation) =>
    set((state) => ({
      annotations: [...state.annotations, annotation],
    })),

  // Add saved annotations from server (these are already saved)
  addSavedAnnotations: (annotations) =>
    set((state) => {
      const newSavedIds = new Set(state.savedAnnotationIds);
      annotations.forEach(ann => newSavedIds.add(ann.id));
      
      return {
        annotations: [...state.annotations, ...annotations],
        savedAnnotationIds: newSavedIds,
      };
    }),

  // Undo last annotation
  handleUndo: () =>
    set((state) => ({
      annotations: state.annotations.slice(0, -1),
    })),

  // Remove annotation by ID
  removeAnnotation: (id) =>
    set((state) => ({
      annotations: state.annotations.filter((ann) => ann.id !== id),
      savedAnnotationIds: new Set([...state.savedAnnotationIds].filter(savedId => savedId !== id)),
    })),

  // Clear all annotations
  clearAll: () =>
    set({
      annotations: [],
      savedAnnotationIds: new Set(),
    }),

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

  // Save annotations to server
  saveAnnotationsToServer: async (fileId: string) => {
    const state = get();
    // Only get unsaved annotations
    const unsavedAnnotations = state.annotations.filter(
      annotation => !state.savedAnnotationIds.has(annotation.id)
    );
    
    if (unsavedAnnotations.length === 0) {
      throw new Error("No new annotations to save");
    }

    const apiAnnotations: ApiAnnotation[] = unsavedAnnotations.map((annotation) => ({
      fileId: fileId,
      pageNumber: annotation.pageNumber,
      content: annotation.content || annotation.textContent,
      position: { x: annotation.x, y: annotation.y },
      type: annotation.type,
      color: annotation.color,
      width: annotation.width,
      height: annotation.height,
      imageData: annotation.imageData,
    }));

    return {
      annotations: apiAnnotations,
    };
  },

  // Mark annotations as saved (called after successful save)
  markAnnotationsAsSaved: (annotationIds: string[]) =>
    set((state) => {
      const newSavedIds = new Set(state.savedAnnotationIds);
      annotationIds.forEach(id => newSavedIds.add(id));
      return { savedAnnotationIds: newSavedIds };
    }),
}));

export default usePdfStore;
