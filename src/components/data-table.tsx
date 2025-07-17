"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconStar,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistanceToNow } from "date-fns";
import CollaboratorsDialog from "./molecues/global/CollaboratorsDialog";
import { useRouter } from "next/navigation";
import { useShareDialogStore } from "@/hooks/stores/otherStore";
import ShareDialog from "./molecues/global/ShareDialog";
import { useGetAllFiles } from "@/hooks/apis/file";
import { useDataTableStore } from "@/hooks/stores/useDataTableStore";

// Utility to generate a color from a string (e.g., user id or name)
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 60%)`;
  return color;
}

// New schema for PDF data
type Collaborator = {
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  role: string;
  _id: string;
};

export type PdfRow = {
  id: string;
  title: string;
  uploadedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: string;
  updatedAt: string;
  collaborators: Collaborator[];
  favorite?: boolean;
};

// New columns for PDF table
const columns: ColumnDef<PdfRow>[] = [
  {
    id: "favorite",
    header: () => null,
    cell: ({ row }) => (
      <Button variant="ghost" size="icon" aria-label="Add to favorite">
        <IconStar className="size-5 text-muted-foreground" />
      </Button>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "File Title",
    cell: ({ row }) => row.original.title,
  },
  {
    accessorKey: "uploadedBy",
    header: "Uploaded By",
    cell: ({ row }) => {
      const user = row.original.uploadedBy;
      if (!user) return <span className="text-muted-foreground">Unknown</span>;
      return (
        user.firstName ?? <span className="text-muted-foreground">Unknown</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "File Status",
    cell: ({ row }) => {
      const status = row.original.status?.toLowerCase();
      let badgeClass = "px-1.5 capitalize";
      let badgeColor = "outline";
      if (status === "active") {
        badgeColor = "success";
        badgeClass += " bg-green-100 text-green-800 border-green-200";
      } else if (status === "inactive") {
        badgeColor = "secondary";
        badgeClass += " bg-gray-100 text-gray-800 border-gray-200";
      } else if (status === "archived") {
        badgeColor = "destructive";
        badgeClass += " bg-red-100 text-red-800 border-red-200";
      } else if (status === "processing") {
        badgeColor = "outline";
        badgeClass += " bg-yellow-100 text-yellow-800 border-yellow-200";
      } else if (status === "pending") {
        badgeColor = "outline";
        badgeClass += " bg-blue-100 text-blue-800 border-blue-200";
      } else {
        badgeColor = "outline";
        badgeClass += " bg-muted text-muted-foreground border-muted";
      }
      return (
        <Badge variant={badgeColor} className={badgeClass}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    cell: ({ row }) => {
      const date = row.original.updatedAt;
      let formatted = "-";
      if (date) {
        try {
          const d = new Date(date);
          if (!isNaN(d.getTime())) {
            formatted = formatDistanceToNow(d, { addSuffix: true });
          }
        } catch {
          formatted = "-";
        }
      }
      return formatted === "less than a minute ago" ? "just now" : formatted;
    },
  },
  {
    accessorKey: "collaborators",
    header: "Collaborators",
    cell: ({ row }) => {
      const collaborators = row.original.collaborators || [];
      const maxAvatars = 5;
      const overflow = collaborators.length - maxAvatars;
      return (
        <div className="flex -space-x-2">
          {collaborators.slice(0, maxAvatars).map((collab, idx) => {
            const name = collab.userId.firstName || collab.userId._id;
            const bg = stringToColor(name + idx); // Add idx for uniqueness
            return (
              <Avatar
                key={collab.userId._id + idx}
                className="size-6 border-2 border-white"
              >
                <AvatarImage
                  src={collab.userId.avatarUrl || ""}
                  alt={collab.userId.firstName}
                />
                <AvatarFallback style={{ background: bg, color: "#fff" }}>
                  {collab.userId.firstName ? collab.userId.firstName[0] : "?"}
                </AvatarFallback>
              </Avatar>
            );
          })}
          {overflow > 0 && (
            <Avatar className="size-6 border-2 border-white" key="overflow">
              <AvatarFallback
                style={{ background: "#888", color: "#fff" }}
              >{`+${overflow}`}</AvatarFallback>
            </Avatar>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex "
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Share</DropdownMenuItem>
          <DropdownMenuItem>Add to Favourite</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export function DataTable({ forceInitialLoading = false }: { forceInitialLoading?: boolean }) {
  // Only use Zustand for data and loading
  const { data, setData, loading, setLoading } = useDataTableStore();

  // All other state is local
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [openDialog, setOpenDialog] = React.useState(false);
  const [dialogCollaborators, setDialogCollaborators] = React.useState<Collaborator[]>([]);

  const router = useRouter();
  const { openDialog: openShareDialog } = useShareDialogStore();

  const { data: fetchedData, loading: fetchedLoading } = useGetAllFiles();

  // Sync fetched data/loading to Zustand store
  React.useEffect(() => {
    setLoading(fetchedLoading);
    if (Array.isArray(fetchedData)) {
      const mapped = fetchedData.map((item: any) => ({
        id: item._id,
        title: item.title,
        uploadedBy: item.uploadedBy,
        status: item.status,
        updatedAt: item.updatedAt,
        collaborators: item.collaborators,
        favorite: false,
        fileId: item.fileId,
      }));
      setData(mapped);
    }
  }, [fetchedData, fetchedLoading, setData, setLoading]);

  const handleOpenCollaborators = (collaborators: any[]) => {
    setDialogCollaborators(collaborators);
    setOpenDialog(true);
  };

  const patchedColumns = React.useMemo(() => {
    return columns.map((col) => {
      if (col.accessorKey === "collaborators") {
        return {
          ...col,
          cell: ({ row }: any) => {
            const collaborators = row.original.collaborators || [];
            const maxAvatars = 5;
            const overflow = collaborators.length - maxAvatars;
            const handleAvatarClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              handleOpenCollaborators(collaborators);
            };
            return (
              <div
                className="w-full h-full cursor-pointer"
                onClick={handleAvatarClick}
                tabIndex={0}
                role="button"
                aria-label="Show all collaborators"
                style={{ display: "flex", alignItems: "center" }}
              >
                <div className="flex -space-x-2">
                  {collaborators.slice(0, maxAvatars).map((collab: any, idx: number) => {
                    const name = collab.userId.firstName || collab.userId._id;
                    const bg = stringToColor(name + idx);
                    return (
                      <Avatar
                        key={collab.userId._id + idx}
                        className="size-6 border-2 border-white"
                      >
                        <AvatarImage
                          src={collab.userId.avatarUrl || ""}
                          alt={collab.userId.firstName}
                        />
                        <AvatarFallback style={{ background: bg, color: "#fff" }}>
                          {collab.userId.firstName ? collab.userId.firstName[0] : "?"}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {overflow > 0 && (
                    <Avatar className="size-6 border-2 border-white" key="overflow">
                      <AvatarFallback style={{ background: "#888", color: "#fff" }}>
                        +{overflow}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            );
          },
        };
      }
      if (col.id === "actions") {
        return {
          ...col,
          cell: ({ row }: any) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="data-[state=open]:bg-muted text-muted-foreground flex"
                  size="icon"
                >
                  <IconDotsVertical />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto">
                <DropdownMenuItem onClick={() => router.push(`/docs/${row.original.fileId}`)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    openShareDialog(`${window.location.origin}/docs/${row.original.fileId}`)
                  }
                >
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>Add to Favourite</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        };
      }
      return col;
    });
  }, [router, openShareDialog, handleOpenCollaborators]);

  const table = useReactTable({
    data,
    columns: patchedColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Loading skeleton component
  function LoadingSkeleton() { 
    return (
      <div className="overflow-hidden rounded-lg border animate-pulse">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              {columns.map((col, idx) => (
                <TableHead key={idx}>
                  <div className="h-4 bg-muted-foreground/20 rounded w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, rowIdx) => (
              <TableRow key={rowIdx}>
                {columns.map((_, colIdx) => (
                  <TableCell key={colIdx}>
                    <div className="h-4 bg-muted-foreground/10 rounded w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Show skeleton if loading or forceInitialLoading is true
  if (loading || forceInitialLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <ShareDialog />
      {/* Render CollaboratorsDialog ONCE here */}
      <CollaboratorsDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        collaborators={dialogCollaborators}
      />
      <Tabs
        defaultValue="outline"
        className="w-full flex-col justify-start gap-6"
      >
        <div className="flex items-center justify-between px-4 lg:px-6">
          <Label htmlFor="view-selector" className="sr-only">
            View
          </Label>
          <Select defaultValue="outline">
            <SelectTrigger
              className="flex w-fit @4xl/main:hidden"
              size="sm"
              id="view-selector"
            >
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="past-performance">Past Performance</SelectItem>
              <SelectItem value="key-personnel">Key Personnel</SelectItem>
              <SelectItem value="focus-documents">Focus Documents</SelectItem>
            </SelectContent>
          </Select>
          <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
            <TabsTrigger value="outline">All</TabsTrigger>
            <TabsTrigger value="past-performance">Created by Me</TabsTrigger>
            <TabsTrigger value="key-personnel">Shared with me</TabsTrigger>
            <TabsTrigger value="focus-documents">Favourite</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent
          value="outline"
          className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        >
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} colSpan={header.colSpan}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody className="**:data-[slot=table-cell]:first:w-8">
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="flex items-center justify-between px-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <IconChevronRight />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <IconChevronsRight />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent
          value="past-performance"
          className="flex flex-col px-4 lg:px-6"
        >
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
        </TabsContent>
        <TabsContent
          value="key-personnel"
          className="flex flex-col px-4 lg:px-6"
        >
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
        </TabsContent>
        <TabsContent
          value="focus-documents"
          className="flex flex-col px-4 lg:px-6"
        >
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
        </TabsContent>
      </Tabs>
    </>
  );
}
