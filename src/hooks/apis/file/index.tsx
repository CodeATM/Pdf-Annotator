"use client";
import FileService from "@/services/files";
import { useState, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toasters";

export const useUploadPDF = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({});

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

      setData(res.data.data);

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

  return { loading, data, onUpload };
};

export const useGetFile = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({});

  const onGetFile = async ({
    fileId,
    successCallback,
    errorCallback,
  }: {
    fileId: string;
    successCallback?: (data: any) => void;
    errorCallback?: (error: any) => void;
  }) => {
    setLoading(true);
    try {
      const response = await FileService.getSinglePdf({ fileId });

      setData(response.data.data);
      showSuccessToast({ message: "File fetched successfully" });

      if (successCallback) successCallback(response.data.data);
    } catch (error: any) {
      const apiResponse = error.response?.data || {
        message: "An unknown error occurred",
        description: "",
      };

      showErrorToast({
        message: apiResponse.message,
        description: apiResponse.description,
      });
      if (errorCallback) errorCallback(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, onGetFile, data };
};


export const useGetAllFiles = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]); // assuming it's an array of files

  const onGetFiles = async ({
    successCallback,
    errorCallback,
  }: {
    successCallback?: () => void;
    errorCallback?: (error: any) => void;
  } = {}) => {
    setLoading(true);
    try {
      const response = await FileService.getFiles();
      setData(response.data?.data);
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
      if (errorCallback) errorCallback(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    onGetFiles(); // Automatically fetch on mount
  }, []);

  return { loading, onGetFiles, data };
};

// Add this hook for editing a file
type EditFilePayload = { fileId: string; title: string; description: string };
export const useEditFile = () => {
  const [loading, setLoading] = useState(false);

  const onEditFile = async (
    { fileId, title, description }: EditFilePayload,
    successCallback?: () => void,
    errorCallback?: (error: any) => void
  ) => {
    setLoading(true);
    try {
      await FileService.editFile({ fileId, payload: { title, description } });
      showSuccessToast({ message: "File updated successfully" });
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
      if (errorCallback) errorCallback(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, onEditFile };
};