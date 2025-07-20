import { Annotation } from "@/lib/types";

interface AnnotationRendererProps {
  pageViewports: { [key: number]: { width: number; height: number; rotation: number } };
  pageRefs: React.MutableRefObject<{ [key: number]: HTMLDivElement | null }>;
}

export const useAnnotationRenderer = ({
  pageViewports,
  pageRefs,
}: AnnotationRendererProps) => {
  const renderAnnotation = (
    annotation: Annotation,
    pageNumber: number
  ): React.CSSProperties => {
    const viewport = pageViewports[pageNumber];
    const pageElement = pageRefs.current[pageNumber];
    if (!viewport || !pageElement) return {};

    const pageRect = pageElement.getBoundingClientRect();
    const scaleX = pageRect.width / viewport.width;
    const scaleY = pageRect.height / viewport.height;

    let left, top, width, height;
    if (annotation.type === "signature") {
      left = annotation.x * scaleX;
      top = annotation.y * scaleY;
      width = annotation.width * scaleX;
      height = annotation.height * scaleY;
    } else {
      left =
        (annotation.width < 0
          ? annotation.x + annotation.width
          : annotation.x) * scaleX;
      top =
        (annotation.height < 0
          ? annotation.y + annotation.height
          : annotation.y) * scaleY;
      width = Math.abs(annotation.width) * scaleX;
      height = Math.abs(annotation.height) * scaleY;
    }

    // Constrain annotations within the page container
    left = Math.max(0, Math.min(left, pageRect.width - width));
    top = Math.max(0, Math.min(top, pageRect.height - height));

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  };

  return { renderAnnotation };
}; 