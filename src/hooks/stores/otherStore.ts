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
