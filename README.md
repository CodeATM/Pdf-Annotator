# PDF Annotator

A powerful, web-based PDF annotation tool built with Next.js and TypeScript that allows users to highlight, underline, and add signatures to PDF documents.

## Features

- 📝 PDF Annotations
  - Highlight text and areas
  - Add underlines
  - Insert digital signatures
  - Free-form drawing capabilities
- 🎨 Customization
  - Adjustable signature size
  - Multiple annotation tools
  - Undo/redo functionality
- 💾 Document Management
  - PDF file upload
  - Export annotated PDFs
  - File size validation
- 🎯 User Experience
  - Responsive design
  - Real-time preview
  - Intuitive interface
  - Drag and drop file upload

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **PDF Processing**: pdf-lib
- **PDF Viewing**: react-pdf
- **Signature Pad**: react-signature-pad-wrapper
- **File Handling**: react-dropzone
- **Styling**: Tailwind CSS
- **Icons**: Radix UI Icons

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pdf-annotator.git
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Usage

1. **Upload PDF**
   - Click the upload button or drag and drop a PDF file
   - Maximum file size can be configured (default 10MB)

2. **Add Annotations**
   - Highlight: Click the highlight tool and drag across any area
   - Underline: Select the underline tool and drag where needed
   - Signature: 
     1. Click the signature tool
     2. Click where you want to place the signature
     3. Draw your signature in the modal
     4. Adjust size using the slider
     5. Click "Add Signature"

3. **Manage Annotations**
   - Use the undo button to remove the last annotation
   - Clear all annotations with the reset button
   - Export the annotated PDF using the export button

## Component Structure

```
src/
├── app/
│   └── page.tsx           # Main page component
└── components/
    └── pdf-viewer/
        └── AnnotationLayer.tsx  # PDF annotation component
```

### Key Components

1. **PDFAnnotator**
   - Main component handling PDF rendering and annotations
   - Manages file upload and tool selection
   - Coordinates all sub-components

2. **Toolbar**
   - Contains annotation tools and action buttons
   - Handles tool selection and file operations

3. **SignatureModal**
   - Manages signature creation and placement
   - Provides size adjustment controls

4. **AnnotationTools**
   - Individual tool buttons for different annotation types
   - Visual feedback for active tools

## API Reference

### PDFAnnotator Props

```typescript
interface PDFAnnotatorProps {
  maxFileSize?: number;        // Maximum file size in MB
  onFileUpload?: (file: File) => void;  // File upload callback
}
```

### Annotation Types

```typescript
type AnnotationType = 'highlight' | 'underline' | 'signature';

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
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- [pdf-lib](https://github.com/Hopding/pdf-lib) for PDF manipulation
- [react-pdf](https://github.com/wojtekmaj/react-pdf) for PDF rendering
- [react-signature-pad-wrapper](https://github.com/michaeldzjap/react-signature-pad-wrapper) for signature functionality
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for icons and components

## Support

For support, please open an issue in the repository or contact [your-email@example.com](mailto:your-email@example.com).
