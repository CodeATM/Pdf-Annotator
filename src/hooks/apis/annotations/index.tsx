"use client";
import AnnotationService from "@/services/annotations";
import { useState } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toasters";
import { ApiAnnotation } from "@/lib/types";

export const useCreateAnnotation = () => {
  const [loading, setLoading] = useState(false);

  const onCreateAnnotation = async ({
    payload,
    successCallback,
  }: {
    payload: {
      annotations: ApiAnnotation[];
    };
    successCallback?: () => void;
  }) => {
    setLoading(true);
    try {
      console.log(payload);
      const res = await AnnotationService.createAnnotation({ payload });

      console.log("Annotation created:", res);

      showSuccessToast({
        message: "Annotations saved successfully",
        description: "Your annotations have been saved to the server",
      });

      successCallback?.();
    } catch (error: any) {
      const apiResponse = error.response?.data || {
        message: "Failed to save annotations",
        description: "An unknown error occurred while saving annotations",
      };

      showErrorToast({
        message: apiResponse.message,
        description: apiResponse.description,
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, onCreateAnnotation };
};
