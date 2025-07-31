import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Smile } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { AnnotationType } from "@/lib/types";
import { MentionInput } from "./MentionInput";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Example collaborators data
const collaborators = [
  { id: "1", display: "Alice" },
  { id: "2", display: "Bob" },
  { id: "3", display: "Charlie" },
];

interface CommentDialogProps {
  showCommentDialog: boolean;
  setShowCommentDialog: (show: boolean) => void;
  commentDialogPos: {
    x: number;
    y: number;
    screenX: number;
    screenY: number;
    pageNumber: number;
    author?: string;
  } | null;
  commentText: string;
  setCommentText: (text: string) => void;
  handleCommentSubmit: () => void;
  setActiveTool: (tool: AnnotationType | null) => void;
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
    setCommentText(commentText + emojiData.emoji);
  };

  if (!showCommentDialog || !commentDialogPos) return null;

  return (
    <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
      <DialogContent
        style={{
          position: "fixed",
          left: commentDialogPos.screenX,
          top: commentDialogPos.screenY,
          padding: 16,
          zIndex: 1000,
          transform: "none",
        }}
        showCloseButton={false}
        className="bg-white/90 backdrop-blur-xl border border-zinc-200 shadow-2xl rounded-xl p-4 w-auto"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
            <span>Add a comment</span>
            <div className="w-6 h-6">
              <Avatar className="w-6 h-6">
                <AvatarFallback>{commentDialogPos?.author ? commentDialogPos.author[0].toUpperCase() : "?"}</AvatarFallback>
              </Avatar>
            </div>
            {commentDialogPos?.author && (
              <span className="text-xs text-zinc-500">{commentDialogPos.author}</span>
            )}
          </div>

          <MentionInput
            value={commentText}
            onChange={setCommentText}
            placeholder="Type your comment and use @ to mention…"
            className="min-h-[90px] w-[280px] resize-none rounded-md border-zinc-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
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
                theme={Theme.LIGHT}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 