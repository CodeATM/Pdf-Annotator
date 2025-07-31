import { create } from "zustand";
import commentService from "@/services/comment";

interface CommentData {
  _id: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username?: string;
    avatar?: string;
  };
  fileId: string;
  parentId: string | null;
  taggedUsers: string[];
  deleted: boolean;
  commentId: string;
  replies: any[];
  createdAt: string;
  updatedAt: string;
}

interface CommentStoreState {
  comments: { [commentId: string]: CommentData };
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchComment: (commentId: string, silent?: boolean) => Promise<CommentData | null>;
  refetchComment: (commentId: string) => Promise<CommentData | null>;
  updateComment: (commentId: string, data: CommentData) => void;
  removeComment: (commentId: string) => void;
  clearComments: () => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const useCommentStore = create<CommentStoreState>((set, get) => ({
  comments: {},
  isLoading: false,
  error: null,

  fetchComment: async (commentId: string, silent: boolean = false) => {
    if (!silent) {
      set({ isLoading: true, error: null });
    }
    
    try {
      const response = await commentService.getCommentThread(commentId);
      const commentData = response.data.data;
      
      if (commentData) {
        set((state) => ({
          comments: {
            ...state.comments,
            [commentId]: commentData
          },
          isLoading: silent ? state.isLoading : false
        }));
        return commentData;
      }
      return null;
    } catch (error) {
      if (!silent) {
        set({ 
          error: "Failed to fetch comment", 
          isLoading: false 
        });
      }
      return null;
    }
  },

  updateComment: (commentId: string, data: CommentData) => {
    set((state) => ({
      comments: {
        ...state.comments,
        [commentId]: data
      }
    }));
  },

  // Force refetch a comment (useful for real-time updates)
  refetchComment: async (commentId: string) => {
    return await get().fetchComment(commentId);
  },

  removeComment: (commentId: string) => {
    set((state) => {
      const newComments = { ...state.comments };
      delete newComments[commentId];
      return { comments: newComments };
    });
  },

  clearComments: () => {
    set({ comments: {} });
  },

  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

export default useCommentStore; 