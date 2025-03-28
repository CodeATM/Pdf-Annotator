"use client"

// components/AnnotationToolbar.tsx
import { useState } from 'react';

type AnnotationTool = 'highlight' | 'underline' | 'signature' | 'none';

interface AnnotationToolbarProps {
  activeTool: AnnotationTool;
  onToolSelect: (tool: AnnotationTool) => void;
  onAddSignature: () => void;
  onExport: () => void;
}

const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
  activeTool,
  onToolSelect,
  onAddSignature,
  onExport,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-gray-100 rounded-md">
      <button
        className={`px-3 py-1 rounded-md ${
          activeTool === 'highlight'
            ? 'bg-yellow-400 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-200'
        }`}
        onClick={() => onToolSelect('highlight')}
        aria-label="Highlight tool"
      >
        Highlight
      </button>
      <button
        className={`px-3 py-1 rounded-md ${
          activeTool === 'underline'
            ? 'bg-blue-400 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-200'
        }`}
        onClick={() => onToolSelect('underline')}
        aria-label="Underline tool"
      >
        Underline
      </button>
      <button
        className="px-3 py-1 bg-white text-gray-700 rounded-md hover:bg-gray-200"
        onClick={onAddSignature}
        aria-label="Add signature"
      >
        Add Signature
      </button>
      <div className="flex-grow"></div>
      <button
        className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
        onClick={onExport}
        aria-label="Export PDF"
      >
        Export PDF
      </button>
    </div>
  );
};

export default AnnotationToolbar;