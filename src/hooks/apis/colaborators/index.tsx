"use client";
import FileService from "@/services/files";
import { useState, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toasters";
import CollaborationService from "@/services/collaboration";

export const useGetCollaborators = () => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);

  const onGetCollaborators = async ({
    fileId,
    successCallback,
    errorCallback,
  }: {
    fileId: string;
    successCallback?: () => void;
    errorCallback?: (error: any) => void;
  }) => {
    setLoading(true);
    try {
      const response = await CollaborationService.getCollaboratiors({ fileId });
      setData(response.data?.data);
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
    onGetCollaborators;
  }, []);

  return { loading, onGetCollaborators, data };
};

export const useUpdateRole = () => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);

  const onUpdate = async ({
    fileId,
    payload,
    successCallback,
    errorCallback,
  }: {
    fileId: string;
    payload: any;
    successCallback?: () => void;
    errorCallback?: (error: any) => void;
  }) => {
    setLoading(true);
    try {
      const response = await CollaborationService.updateUserRole({
        fileId,
        payload,
      });
      setData(response.data?.data);
      if (response.data && response.data.error === false) {
        showSuccessToast({ message: response.data.message || "Role updated successfully" });
        if (successCallback) successCallback();
      }
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

  return { loading, onUpdate, data };
};

export const useRemoveCollaborator = () => {
  const [loading, setLoading] = useState(false);

  const onRemoveCollaborator = async ({
    fileId,
    userId,
    successCallback,
    errorCallback,
  }: {
    fileId: string;
    userId: string;
    successCallback?: () => void;
    errorCallback?: (error: any) => void;
  }) => {
    setLoading(true);
    try {
      const response = await CollaborationService.removeCollaborator({
        fileId,
        userId,
      });
      if (response.data && response.data.error === false) {
        showSuccessToast({
          message: response.data.message || "Collaborator removed successfully",
          description: "The collaborator has been removed from the file"
        });
        if (successCallback) successCallback();
      }
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

  return { loading, onRemoveCollaborator };
};
