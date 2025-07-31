import { useState, useEffect } from "react";
import commentService from "@/services/comment";
import { toast } from "sonner";

export const useAddComment = () => {
  const [loading, setLoading] = useState(false);

  const onAddComment = async ({
    fileId,
    payload,
    successCallback,
    errorCallback,
  }: {
    fileId: string;
    payload: any;
    successCallback?: (response?: any) => void;
    errorCallback?: (error: any) => void;
  }) => {
    setLoading(true);
    try {
      const response = await commentService.createComment({ fileId, payload });
      toast.success("Comment added successfully");
      if (successCallback) successCallback(response.data);
      return response.data;
    } catch (error: any) {
      toast.error("Failed to add comment");
      if (errorCallback) errorCallback(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, onAddComment };
};

export const useGetCommentThread = () => {
  const [loading, setLoading] = useState(false);
  const [commentData, setCommentData] = useState<any>(null);

  const getCommentThread = async (commentId: string) => {
    setLoading(true);
    try {
      const response = await commentService.getCommentThread(commentId);
      setCommentData(response.data.data);
      console.log(response.data.data);
      return response.data.data;
    } catch (error: any) {
      toast.error("Failed to fetch comment details");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, commentData, getCommentThread };
};

export const useAddReply = () => {
  const [loading, setLoading] = useState(false);

  const onAddReply = async ({
    fileId,
    payload,
    successCallback,
    errorCallback,
  }: {
    fileId: string;
    payload: any;
    successCallback?: (response?: any) => void;
    errorCallback?: (error: any) => void;
  }) => {
    setLoading(true);
    try {
      const response = await commentService.createReply({ fileId, payload });
      toast.success("Reply added successfully");
      if (successCallback) successCallback(response.data);
      return response.data;
    } catch (error: any) {
      toast.error("Failed to add reply");
      if (errorCallback) errorCallback(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, onAddReply };
};
