"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEditPdfDialogStore } from "@/hooks/stores/otherStore";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import { useEditFile, useGetFile } from "@/hooks/apis/file";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useFileMetaStore } from "@/hooks/stores/otherStore";

export default function EditPdfDialog({ onFileUpdated }: { onFileUpdated?: () => void }) {
  const { isOpen, closeDialog, fileData } = useEditPdfDialogStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setTitle(fileData?.title || "");
    setDescription(fileData?.description || "");
  }, [fileData, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-md w-full rounded-xl shadow-2xl border border-zinc-200 bg-background p-0 animate-in fade-in-0 zoom-in-95">
        <div className="flex flex-col items-center pt-8 pb-2">
          <div className="bg-primary/10 rounded-full p-3 mb-2">
            <FileText className="w-8 h-8 text-primary" />
          </div>
        </div>
        <DialogHeader className="px-7 pt-0 pb-2">
          <DialogTitle className="text-center">Edit File Details</DialogTitle>
          <DialogDescription className="text-center">
            Update the title and description of your file.
          </DialogDescription>
        </DialogHeader>
        <div className="border-b border-zinc-100 mx-7 mb-2" />
        <div className="flex-1 flex flex-col px-7 pb-2">
          <EditForm
            fileData={fileData}
            closeDialog={closeDialog}
            onFileUpdated={onFileUpdated}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required").max(100, "Title too long"),
  description: Yup.string().max(500, "Description too long"),
});

const EditForm = ({ fileData, closeDialog, onFileUpdated }: any) => {
  const { loading, onEditFile } = useEditFile();
  const { onGetFile } = useGetFile();
  const setFileMeta = useFileMetaStore((state) => state.setFileMeta);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: fileData?.title || "",
      description: fileData?.description || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!fileData?.fileId) return;
      await onEditFile(
        { fileId: fileData.fileId, title: values.title, description: values.description },
        async () => {
          // Fetch latest file data and update Zustand store
          await onGetFile({
            fileId: fileData.fileId,
            successCallback: (freshData: any) => {
              setFileMeta({
                fileId: freshData?.fileId,
                title: freshData?.title,
                description: freshData?.description,
                status: freshData?.status,
                size: freshData?.size,
                createdAt: freshData?.createdAt,
                updatedAt: freshData?.updatedAt,
                fileUrl: freshData?.fileUrl,
                annotations: freshData?.annotations,
              });
            },
          });
          closeDialog();
          if (onFileUpdated) onFileUpdated();
        }
      );
    },
  });

  return (
    <form className="space-y-6 mt-2 pb-4 " onSubmit={formik.handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="edit-title">Title</Label>
        <Input
          id="edit-title"
          name="title"
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`rounded-md border-zinc-200 outline-none text-base transition-all duration-150 ${formik.touched.title && formik.errors.title ? "border-red-500" : ""}`}
          placeholder="Enter file title"
          aria-invalid={!!(formik.touched.title && formik.errors.title)}
        />
        {formik.touched.title && formik.errors.title && (
          <div className="text-red-500 text-xs">{formik.errors.title}</div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-description">Description</Label>
        <textarea
          id="edit-description"
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`rounded-md text-base min-h-[80px] outline-none border-[1px] border-zinc-400 resize-y w-full px-3 py-2 bg-background shadow-xs transition-all duration-150 placeholder:text-muted-foreground ${formik.touched.description && formik.errors.description ? "border-red-500" : ""}`}
          placeholder="Enter file description"
          aria-invalid={!!(formik.touched.description && formik.errors.description)}
        />
        {formik.touched.description && formik.errors.description && (
          <div className="text-red-500 text-xs">{formik.errors.description}</div>
        )}
      </div>
      <DialogFooter className="pt-2">
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-md shadow transition-all duration-150 focus:ring-2 focus:ring-primary/60 focus:outline-none"
          disabled={loading || !formik.isValid || formik.isSubmitting}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
};
