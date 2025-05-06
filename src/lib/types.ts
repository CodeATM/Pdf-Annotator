import { MutableRefObject } from "react";

export type AnnotationType = "highlight" | "underline" | "signature";

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
  signaturePadRef: MutableRefObject<SignaturePadRef | null>;
  signatureSize: { width: number; height: number };
  setSignatureSize: (size: { width: number; height: number }) => void;
  handleClearSignature: () => void;
  handleSaveSignature: () => void;
}

export interface PDFAnnotatorProps {
  maxFileSize?: number; // Optional prop for file size limit in MB
  onFileUpload?: (file: File) => void; // Optional callback for file upload
}
