import { PDFDocument, rgb } from "pdf-lib";
import { Annotation } from "@/lib/types";
import { showSuccessToast, showErrorToast } from "@/utils/toasters";

interface PdfExportHandlerProps {
  pdfFile: string | File | null;
  annotations: Annotation[];
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePdfExportHandler = ({
  pdfFile,
  annotations,
  setIsLoading,
  setError,
}: PdfExportHandlerProps) => {
  const exportAnnotatedPdf = async () => {
    if (!pdfFile) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const existingPdfBytes =
        typeof pdfFile === "string"
          ? await fetch(pdfFile).then((res) => res.arrayBuffer())
          : await pdfFile.arrayBuffer();

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();

      // Filter annotations to only include highlight, underline, and signature
      const exportableAnnotations = annotations.filter(annotation => 
        annotation.type === "highlight" || 
        annotation.type === "underline" || 
        annotation.type === "signature"
      );

      for (const annotation of exportableAnnotations) {
        const page = pages[annotation.pageNumber - 1];
        if (!page) continue;

        const { width: pageWidth, height: pageHeight } = page.getSize();

        // Normalize annotation rectangle to handle negative dimensions
        const rectX =
          annotation.width < 0 ? annotation.x + annotation.width : annotation.x;
        const rectY =
          annotation.height < 0
            ? annotation.y + annotation.height
            : annotation.y;
        const rectWidth = Math.abs(annotation.width);
        const rectHeight = Math.abs(annotation.height);

        // Parse the color from the annotation's stored color
        const colorRgba = annotation.color || "rgba(255, 235, 60, 0.5)";
        const colorMatch = colorRgba.match(
          /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
        );

        let r = 1,
          g = 1,
          b = 0,
          a = 0.4; // Default yellow with 0.4 opacity

        if (colorMatch) {
          r = parseInt(colorMatch[1]) / 255;
          g = parseInt(colorMatch[2]) / 255;
          b = parseInt(colorMatch[3]) / 255;
          a = colorMatch[4] ? parseFloat(colorMatch[4]) : 1;
        }

        if (annotation.type === "highlight") {
          page.drawRectangle({
            x: rectX,
            y: pageHeight - rectY - rectHeight,
            width: rectWidth,
            height: rectHeight,
            color: rgb(r, g, b),
            opacity: a,
          });
        } else if (annotation.type === "underline") {
          const lineY = pageHeight - (rectY + rectHeight);
          page.drawLine({
            start: { x: rectX, y: lineY },
            end: {
              x: rectX + rectWidth,
              y: lineY,
            },
            thickness: 2,
            color: rgb(r, g, b),
            opacity: a,
          });
        } else if (annotation.type === "signature" && annotation.imageData) {
          try {
            const signatureBytes = await fetch(annotation.imageData).then(
              (res) => res.arrayBuffer()
            );
            const signatureImage = await pdfDoc.embedPng(signatureBytes);
            page.drawImage(signatureImage, {
              x: annotation.x,
              y: pageHeight - annotation.y - annotation.height,
              width: annotation.width,
              height: annotation.height,
            });
          } catch (error) {
            console.error("Error embedding signature:", error);
          }
        }
      }

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "annotated-document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsLoading(false);
      
      // Show success message
      showSuccessToast({
        message: "PDF Exported Successfully",
        description: `Exported PDF with ${exportableAnnotations.length} annotations`,
      });
    } catch (err) {
      console.error("Error exporting PDF:", err);
      setError("Error exporting PDF. Please try again.");
      setIsLoading(false);
      
      showErrorToast({
        message: "Export Failed",
        description: "Failed to export PDF. Please try again.",
      });
    }
  };

  return { exportAnnotatedPdf };
}; 