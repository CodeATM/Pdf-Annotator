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

export default function EditPdfDialog() {
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
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

const EditForm = ({ title, setTitle, description, setDescription }: any) => {
  // Add a save handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Replace this with your API call or state update logic
    console.log("Saving changes:", { title, description });
  };
  return (
    <form className="space-y-6 mt-2 pb-4 " onSubmit={handleSave}>
      <div className="space-y-2">
        <Label htmlFor="edit-title">Title</Label>
        <Input
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border-zinc-200 outline-none text-base transition-all duration-150"
          placeholder="Enter file title"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-description">Description</Label>
        <textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-md  text-base min-h-[80px] outline-none border-[1px] border-zinc-400 resize-y w-full px-3 py-2 bg-background shadow-xs transition-all duration-150 placeholder:text-muted-foreground"
          placeholder="Enter file description"
        />
      </div>
      <DialogFooter className="pt-2">
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-md shadow transition-all duration-150 focus:ring-2 focus:ring-primary/60 focus:outline-none"
        >
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
};
