"use client";
import AccessService from "@/services/access";
import { useState, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toasters";

export const useRequestAccess = () => {
  const [loading, setLoading] = useState(false);

  const onGetAccess = async ({
    fileId,
    successCallback,
  }: {
    fileId: string;
    successCallback?: () => void;
  }) => {
    setLoading(true);
    try {
      const res = await AccessService.requestAccess({ fileId });

      showSuccessToast({
        message: res.data.message,
        description: "Your request to view this file has been sent",
      });

      successCallback?.();
    } catch (error: any) {
      const apiResponse = error?.response?.data ?? {};
      showErrorToast({
        message: apiResponse.message ?? "Failed to save annotations",
        description:
          apiResponse.description ??
          "An unknown error occurred while saving annotations",
      });
      showErrorToast({
        message: apiResponse.message,
        description: apiResponse.description,
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, onGetAccess };
};

export const useGetAccessRequest = () => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);

  const onGetAccessRequests = async ({
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
      const response = await AccessService.getAllRequests({ fileId });
      setData(response.data?.data);
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
      if (errorCallback) errorCallback(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, onGetAccessRequests, data };
};

export const useApproveAccessRequest = () => {
  const [loading, setLoading] = useState(false);

  const onApproveRequest = async ({
    fileId,
    userId,
    payload,
    successCallback,
  }: {
    fileId: string;
    userId: string;
    payload: { role: string };
    successCallback?: () => void;
  }) => {
    setLoading(true);
    try {
      const res = await AccessService.approveRequest({
        fileId,
        payload: { userId, role: payload.role }
      });

      showSuccessToast({
        message: res.data.message || "Access request approved successfully",
        description: "The user has been granted access to the file",
      });

      successCallback?.();
    } catch (error: any) {
      const apiResponse = error?.response?.data ?? {};
      showErrorToast({
        message: apiResponse.message ?? "Failed to approve access request",
        description: apiResponse.description ?? "An unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, onApproveRequest };
};

export const useDenyAccessRequest = () => {
  const [loading, setLoading] = useState(false);

  const onDenyRequest = async ({
    fileId,
    userId,
    successCallback,
  }: {
    fileId: string;
    userId: string;
    successCallback?: () => void;
  }) => {
    setLoading(true);
    try {
      const res = await AccessService.denyRequest({ fileId, userId });

      showSuccessToast({
        message: res.data.message || "Access request denied successfully",
        description: "The user's access request has been denied",
      });

      successCallback?.();
    } catch (error: any) {
      const apiResponse = error?.response?.data ?? {};
      showErrorToast({
        message: apiResponse.message ?? "Failed to deny access request",
        description: apiResponse.description ?? "An unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, onDenyRequest };
};

export const useDeleteAccessRequest = () => {
  const [loading, setLoading] = useState(false);

  const onDeleteRequest = async ({
    fileId,
    userId,
    successCallback,
  }: {
    fileId: string;
    userId: string;
    successCallback?: () => void;
  }) => {
    setLoading(true);
    try {
      const res = await AccessService.deleteRequest({ fileId, userId });

      showSuccessToast({
        message: res.data.message || "Access request deleted successfully",
        description: "The access request has been removed",
      });

      successCallback?.();
    } catch (error: any) {
      const apiResponse = error?.response?.data ?? {};
      showErrorToast({
        message: apiResponse.message ?? "Failed to delete access request",
        description: apiResponse.description ?? "An unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, onDeleteRequest };
};
