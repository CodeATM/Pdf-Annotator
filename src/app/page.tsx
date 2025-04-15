"use client";

import PDFAnnotator from "@/components/pdf-viewer/AnnotationLayer";
import React from "react";

const Page = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <PDFAnnotator
          maxFileSize={10} // 10MB limit
          onFileUpload={(file: File) => {
            console.log("File uploaded:", file.name);
          }}
        />
      </div>
    </div>
  );
};

export default Page;
