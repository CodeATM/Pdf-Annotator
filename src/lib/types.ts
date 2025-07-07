import { MutableRefObject } from "react";

export type AnnotationType = "highlight" | "underline" | "signature" | "comment" | "note";

export interface Annotation {
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
  content?: string; // For comments and notes
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// New interface for API requests
export interface ApiAnnotation {
  fileId: string;
  pageNumber: number;
  content?: string;
  position: { x: number; y: number };
  type: string;
  color?: string;
  width?: number;
  height?: number;
  imageData?: string;
}

export interface SignaturePosition {
  x: number;
  y: number;
  pageNumber: number;
  pageWidth: number;
  pageHeight: number;
}

export interface PageViewport {
  width: number;
  height: number;
  rotation: number;
}

export interface color {
  color: string;
}

export interface SignaturePadRef extends SignaturePad {
  clear: () => void;
  toDataURL: () => string;
}

export interface PageRefs {
  [key: number]: HTMLDivElement | null;
}

export interface SignatureModalProps {
  showSignatureModal: boolean;
  handleCloseModal: () => void;
  signaturePadRef: React.MutableRefObject<SignaturePad | any>;
  signatureSize: { width: number; height: number };
  setSignatureSize: (size: { width: number; height: number }) => void;
  handleClearSignature: () => void;
  handleSaveSignature: () => void;
}

export interface PDFAnnotatorProps {
  maxFileSize?: number; // Optional prop for file size limit in MB
  onFileUpload?: (file: File) => void; // Optional callback for file upload
}

export type User = {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  // Add any other fields you expect from your user API
};
