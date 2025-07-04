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
import { toast } from "sonner"; // assuming you're using `sonner` for toast

const SHARE_LINK = "https://marinabudarina.design";

export default function ShareDialog() {
  const { isOpen, closeDialog } = useShareDialogStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_LINK);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-md p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Share with Friends
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Boost your experience by inviting friends to join you.
          </p>
        </DialogHeader>

        <div className="mt-5 space-y-4">
          <label className="text-sm font-medium text-gray-700">
            Your invite link
          </label>
          <div className="flex items-center space-x-2 mt-2 ">
            <Input
              value={SHARE_LINK}
              readOnly
              className="flex-1 text-sm outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              title="Copy"
            >
              {copied ? <CheckIcon className="h-5 w-5 text-green-600" /> : <CopyIcon className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700">Share on social</p>
          <div className="flex justify-center gap-4 mt-2">
            <Button variant="secondary" size="icon" className="hover:text-blue-600" title="Facebook">
              <Facebook className="w-8 h-8" />
            </Button>
            <Button variant="secondary" size="icon" className="hover:text-sky-400" title="Twitter">
              <Twitter className="w-8 h-8" />
            </Button>
            <Button variant="secondary" size="icon" className="hover:text-green-500" title="WhatsApp or Message">
              <MessageCircle className="w-8 h-8" />
            </Button>
            <Button variant="secondary" size="icon" className="hover:text-blue-700" title="LinkedIn">
              <Linkedin className="w-8 h-8" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
