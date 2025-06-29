"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useUploadPDF } from "@/hooks/apis/file";

interface FileUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onFileUpload?: (file: File | null) => void;
  title?: string;
}

export function FileUploadDialog({
  open,
  onClose,
  onFileUpload,
  title = "Upload and attach files",
}: FileUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const { loading, onUpload } = useUploadPDF();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Check file type
      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed.");
        return;
      }

      // Check file size (1MB = 1048576 bytes)
      if (file.size > 1048576) {
        setError("File size must not exceed 1MB.");
        return;
      }

      // Reset errors and update state
      setError(null);
      setSelectedFile(file);

      const formData = new FormData();
      formData.append("pdf", file);
      setUploadProgress(0);
      onUpload({
        payload: formData,
        successCallback: () => {
          setUploadProgress(100);
          onFileUpload?.(file);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto rounded-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <p className="text-sm text-gray-500">Only PDF files (Max 1MB)</p>
        </DialogHeader>
        <div className="border border-dashed border-gray-300 rounded-md py-10 flex flex-col items-center justify-center gap-2">
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
          <span className="text-sm text-gray-500">
            Choose a PDF file or drag & drop
          </span>
          <label
            htmlFor="file-upload"
            className="bg-primary text-white px-4 py-2 rounded-md text-sm cursor-pointer mt-2"
          >
            Browse files
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        {selectedFile && (
          <p
            className="text-sm text-gray-600 mt-2 truncate overflow-hidden text-ellipsis max-w-full"
            title={selectedFile.name}
          >
            Selected file: {selectedFile.name}
          </p>
        )}
        {uploadProgress !== null && (
          <div className="w-full mt-4">
            <div className="bg-gray-200 h-2 rounded">
              <div
                className="bg-primary h-2 rounded"
                style={{ width: `${uploadProgress ?? (loading ? 50 : 0)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Uploading: {uploadProgress ?? (loading ? 50 : 0)}%
            </p>
          </div>
        )}
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} className="cursor-pointer" >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={onClose}
            className="cursor-pointer"
            disabled={loading || (uploadProgress !== null && uploadProgress < 100)}
          >
            Proceed to edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
