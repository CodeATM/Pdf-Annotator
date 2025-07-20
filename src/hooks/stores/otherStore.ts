// stores/useShareDialogStore.ts
import { create } from "zustand";

interface ShareDialogState {
  isOpen: boolean;
  shareLink: string | null;
  openDialog: (link?: string) => void;
  closeDialog: () => void;
}

export const useShareDialogStore = create<ShareDialogState>((set) => ({
  isOpen: false,
  shareLink: null,
  openDialog: (link) => set({ isOpen: true, shareLink: link ?? null }),
  closeDialog: () => set({ isOpen: false, shareLink: null }),
}));

interface EditPdfDialogState {
  isOpen: boolean;
  fileData: any | null;
  openDialog: (fileData: any) => void;
  closeDialog: () => void;
}

export const useEditPdfDialogStore = create<EditPdfDialogState>((set) => ({
  isOpen: false,
  fileData: null,
  openDialog: (fileData) => set({ isOpen: true, fileData }),
  closeDialog: () => set({ isOpen: false, fileData: null }),
}));

// File metadata store for silent updates
interface FileMetaState {
  fileId: string | null;
  title: string;
  description: string;
  status?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
  fileUrl?: string;
  annotations?: any[];
  collaborators?: any[];
  setFileMeta: (meta: Partial<Omit<FileMetaState, 'setFileMeta' | 'clearFileMeta'>>) => void;
  clearFileMeta: () => void;
}

export const useFileMetaStore = create<FileMetaState>((set) => ({
  fileId: null,
  title: "",
  description: "",
  status: undefined,
  size: undefined,
  createdAt: undefined,
  updatedAt: undefined,
  fileUrl: undefined,
  annotations: undefined,
  collaborators: undefined,
  setFileMeta: (meta) => set((state) => ({ ...state, ...meta })),
  clearFileMeta: () => set({
    fileId: null,
    title: "",
    description: "",
    status: undefined,
    size: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    fileUrl: undefined,
    annotations: undefined,
    collaborators: undefined,
  }),
}));

// Sidebar Favourites Store
interface SidebarFavouritesState {
  favourites: any[];
  loading: boolean;
  error: string | null;
  setFavourites: (favourites: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSidebarFavouritesStore = create<SidebarFavouritesState>((set) => ({
  favourites: [],
  loading: false,
  error: null,
  setFavourites: (favourites) => set({ favourites }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
