"use client";

import React, { useState } from "react";
import { useShareDialogStore } from "@/hooks/stores/otherStore";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Linkedin, MessageCircle } from "lucide-react";
import { CopyIcon, CheckIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

export default function ShareDialog() {
  const { isOpen, closeDialog, shareLink } = useShareDialogStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-md p-7 rounded-2xl shadow-2xl border border-zinc-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-1">
            Share this Document
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center mb-2">
            Copy the link below to share this document with others.
          </p>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <label className="text-xs font-medium text-zinc-600">Document Link</label>
          <div className="flex items-center space-x-2 mt-1 ">
            <Input
              value={shareLink || "No link available"}
              readOnly
              className="flex-1 text-sm outline-none focus-visible:ring-2  bg-white border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 placeholder:text-zinc-400"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              title="Copy"
              disabled={!shareLink}
              className={`transition-colors ${copied ? 'border-green-400' : ''}`}
            >
              {copied ? <CheckIcon className="h-5 w-5 text-green-600" /> : <CopyIcon className="h-5 w-5 text-blue-700" />}
            </Button>
          </div>
        </div>

        <div className="mt-7">
          <p className="text-xs font-medium text-zinc-600 mb-2">Share on social</p>
          <div className="flex justify-center gap-3 mt-1">
            <Button variant="secondary" size="icon" title="Facebook" disabled={!shareLink} className="bg-white">
              <Facebook className="w-7 h-7" style={{ color: '#1877F3' }} />
            </Button>
            <Button variant="secondary" size="icon" title="Twitter" disabled={!shareLink} className="bg-white">
              <Twitter className="w-7 h-7" style={{ color: '#1DA1F2' }} />
            </Button>
            <Button variant="secondary" size="icon" title="WhatsApp or Message" disabled={!shareLink} className="bg-white">
              <MessageCircle className="w-7 h-7" style={{ color: '#25D366' }} />
            </Button>
            <Button variant="secondary" size="icon" title="LinkedIn" disabled={!shareLink} className="bg-white">
              <Linkedin className="w-7 h-7" style={{ color: '#0077B5' }} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
