import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Smile } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface CommentDialogProps {
  showCommentDialog: boolean;
  setShowCommentDialog: (show: boolean) => void;
  commentDialogPos: {
    x: number;
    y: number;
    screenX: number;
    screenY: number;
    pageNumber: number;
  } | null;
  commentText: string;
  setCommentText: (text: string) => void;
  handleCommentSubmit: () => void;
  setActiveTool: (tool: string | null) => void;
  setCommentDialogPos: (pos: any) => void;
}

export const CommentDialog: React.FC<CommentDialogProps> = ({
  showCommentDialog,
  setShowCommentDialog,
  commentDialogPos,
  commentText,
  setCommentText,
  handleCommentSubmit,
  setActiveTool,
  setCommentDialogPos,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleCancel = () => {
    setShowCommentDialog(false);
    setCommentDialogPos(null);
    setCommentText("");
    setActiveTool(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setCommentText((prev: string) => prev + emojiData.emoji);
  };

  if (!showCommentDialog || !commentDialogPos) return null;

  return (
    <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
      <DialogContent
        style={{
          position: "fixed",
          left: commentDialogPos.screenX + 20,
          top: commentDialogPos.screenY + 20,
          width: 300,
          padding: 16,
          zIndex: 1000,
          transform: "none",
        }}
        showCloseButton={false}
        className="bg-white/90 backdrop-blur-xl border border-zinc-200 shadow-2xl rounded-xl p-4"
      >
        <div className="flex flex-col gap-4">
          <div className="text-sm font-semibold text-zinc-800">
            Add a comment
          </div>

          <Textarea
            autoFocus
            placeholder="Type your comment... ✨"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[90px] resize-none rounded-md border-zinc-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-zinc-500 hover:text-orange-500 transition"
            >
              <Smile className="w-5 h-5" />
            </button>

            <div className="flex gap-2">
              <button
                className="text-sm px-3 py-1 rounded-md text-zinc-500 hover:text-zinc-700 transition"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="bg-orange-500 text-white rounded-md px-4 py-1.5 text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                onClick={handleCommentSubmit}
                disabled={!commentText.trim()}
              >
                Comment
              </button>
            </div>
          </div>

          {showEmojiPicker && (
            <div className="absolute z-[1001] top-full mt-2">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme="light"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 