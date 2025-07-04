"use client";
import FileService from "@/services/files";
import { useState } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toasters";

export const useUploadPDF = () => {
  const [loading, setLoading] = useState(false);

  const onUpload = async ({
    payload,
    successCallback,
  }: {
    payload: {
      file: any;
    };
    successCallback?: () => void;
  }) => {
    setLoading(true);
    try {
      const res = await FileService.uploadFile({ payload });

      console.log(res);

      successCallback?.();
    } catch (error: any) {
      const apiResponse = error.response?.data || {
        message: "An unknown error occurred",
        description: "",
      };

      showErrorToast({
        message: apiResponse.message,
        description: apiResponse.description,
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, onUpload };
};

export const useGetFile = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({});

  const onGetFile = async ({
    fileId,
    successCallback,
  }: {
    fileId: string;
    successCallback?: () => void;
  }) => {
    setLoading(true);
    try {
      const response = await FileService.getSinglePdf({ fileId });

      setData(response.data.data);
      showSuccessToast({ message: "File fetched successfully" });

      if (successCallback) successCallback();
    } catch (error: any) {
      const apiResponse = error.response?.data || {
        message: "An unknown error occurred",
        description: "",
      };

      showErrorToast({
        message: apiResponse.message,
        description: apiResponse.description,
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, onGetFile, data };
};
