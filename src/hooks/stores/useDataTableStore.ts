import { create } from "zustand";
import { VisibilityState, ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Collaborator, PdfRow } from "@/components/data-table";

interface DataTableState {
  data: PdfRow[];
  setData: (data: PdfRow[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  rowSelection: Record<string, boolean>;
  setRowSelection: (rowSelection: Record<string, boolean>) => void;
  columnVisibility: VisibilityState;
  setColumnVisibility: (v: VisibilityState) => void;
  columnFilters: ColumnFiltersState;
  setColumnFilters: (v: ColumnFiltersState) => void;
  sorting: SortingState;
  setSorting: (v: SortingState) => void;
  pagination: { pageIndex: number; pageSize: number };
  setPagination: (v: { pageIndex: number; pageSize: number }) => void;
  openDialog: boolean;
  setOpenDialog: (v: boolean) => void;
  dialogCollaborators: Collaborator[];
  setDialogCollaborators: (v: Collaborator[]) => void;
}

export const useDataTableStore = create<DataTableState>((set) => ({
  data: [],
  setData: (data) => set({ data }),
  loading: false,
  setLoading: (loading) => set({ loading }),
  rowSelection: {},
  setRowSelection: (rowSelection) => set({ rowSelection }),
  columnVisibility: {},
  setColumnVisibility: (columnVisibility) => set({ columnVisibility }),
  columnFilters: [],
  setColumnFilters: (columnFilters) => set({ columnFilters }),
  sorting: [],
  setSorting: (sorting) => set({ sorting }),
  pagination: { pageIndex: 0, pageSize: 10 },
  setPagination: (pagination) => set({ pagination }),
  openDialog: false,
  setOpenDialog: (openDialog) => set({ openDialog }),
  dialogCollaborators: [],
  setDialogCollaborators: (dialogCollaborators) => set({ dialogCollaborators }),
})); 