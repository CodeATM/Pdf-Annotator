"use client";
import React, { useRef, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Annotation } from "@/lib/types";
import { X, MessageCircle, Clock, User } from "lucide-react";
import { TipTapEditor } from "./Tiptap";
import useCommentStore from "@/hooks/stores/useCommentStore";
import { formatDistanceToNow } from "date-fns";

interface Collaborator {
  id: string;
  firstName: string;
  lastName?: string;
  avatar?: string;
  email?: string;
}

interface Reply {
  _id: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username?: string;
    avatar?: string;
  };
  commentId: string;
  createdAt: string;
}

interface CommentData {
  _id: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username?: string;
    avatar?: string;
  };
  fileId: string;
  parentId: string | null;
  taggedUsers: string[];
  deleted: boolean;
  commentId: string;
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
}

interface CommentDropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: {
    x: number;
    y: number;
    containerLeft: number;
    containerRight: number;
    containerTop: number;
    containerBottom: number;
    viewportWidth?: number;
    viewportHeight?: number;
    pageRect?: DOMRect;
  } | null;
  comment: Annotation | null;
  onSendReply: (content: string) => void;
  onSendNewComment?: (content: string) => void;
  collaborators?: Collaborator[];
  isNewComment?: boolean;
  isLoading?: boolean;
}

export const CommentDropdown: React.FC<CommentDropdownProps> = ({
  open,
  onOpenChange,
  position,
  comment,
  onSendReply,
  onSendNewComment,
  collaborators = [],
  isNewComment = false,
  isLoading = false,
}) => {
  const [input, setInput] = useState("");
  const [showInput, setShowInput] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [optimisticReplies, setOptimisticReplies] = useState<Reply[]>([]);
  const [editorKey, setEditorKey] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Use comment store for state management
  const { comments, fetchComment, refetchComment, isLoading: storeLoading } = useCommentStore();
  const commentId = comment?.commentId || comment?.id;
  const commentThread = commentId ? comments[commentId] : null;

  // Use real comment data if available, otherwise fall back to annotation data
  const commentAuthor = commentThread?.author || (comment as any)?.author;
  const commentContent = commentThread?.content || comment?.content;
  const replies = commentThread?.replies || [];
  
  // Combine real replies with optimistic replies
  const allReplies = [...replies, ...optimisticReplies];

  // Fetch comment thread when comment changes or dropdown opens
  useEffect(() => {
    if (commentId && !isNewComment && open) {
      fetchComment(commentId);
    }
  }, [commentId, isNewComment, open, fetchComment]);

  // Reset input when opening for new comments
  useEffect(() => {
    if (open && isNewComment) {
      setInput("");
      setShowInput(true);
    }
  }, [open, isNewComment]);

  // Reset comment thread data when dropdown closes
  useEffect(() => {
    if (!open) {
      setInput("");
      setShowInput(true);
    }
  }, [open]);

  // Auto-scroll to bottom when replies change or dropdown opens
  useEffect(() => {
    if (contentRef.current && allReplies.length > 0) {
      const scrollToBottom = () => {
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      };
      
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
    }
  }, [allReplies.length, open]);

  // Handle body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      if (e.key === "Escape") {
        onOpenChange(false);
      } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSend();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange, input]);

  const handleSend = async () => {
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Clean the content by removing <p> tags
      const cleanContent = input.trim().replace(/<p>/g, '').replace(/<\/p>/g, '');
      
      if (isNewComment && onSendNewComment) {
        await onSendNewComment(cleanContent);
        // Show success feedback and close
        setInput("");
        setShowInput(false);
        onOpenChange(false);
      } else if (comment && onSendReply) {
        // Create optimistic reply
        const optimisticReply: Reply = {
          _id: `optimistic-${Date.now()}`,
          content: cleanContent,
          author: {
            _id: "current-user",
            firstName: "You",
            lastName: "",
            email: "",
          },
          commentId: "optimistic",
          createdAt: new Date().toISOString(),
        };
        
        // Add optimistic reply immediately
        setOptimisticReplies(prev => [...prev, optimisticReply]);
        setInput("");
        setEditorKey(prev => prev + 1); // Force editor to re-render with empty content
        setShowSuccess(true);
        
        // Hide success message after 2 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
        
        // Send reply to backend
        await onSendReply(cleanContent);
        
        // Silently refetch comment data to get the real reply and remove optimistic one
        if (commentId) {
          setTimeout(() => {
            // Silent refetch - don't show loading state
            fetchComment(commentId, true).then(() => {
              setOptimisticReplies([]); // Clear optimistic replies after real data loads
            });
          }, 100);
        }
      }
    } catch (error) {
      console.error("Error sending comment/reply:", error);
      // Remove optimistic reply on error
      setOptimisticReplies([]);
      // You can add toast notification here for error feedback
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowInput(false);
    setInput("");
    if (isNewComment) {
      onOpenChange(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Just now";
    }
  };

  const getUserInitials = (firstName: string, lastName?: string) => {
    const first = firstName?.[0]?.toUpperCase() || "";
    const last = lastName?.[0]?.toUpperCase() || "";
    return first + last;
  };

  if (!position || !open) return null;

  const creatorName = commentAuthor
    ? `${commentAuthor?.firstName || ""} ${commentAuthor.lastName || ""}`.trim()
    : "Unknown User";
  const creatorInitials = commentAuthor
    ? getUserInitials(commentAuthor.firstName, commentAuthor.lastName)
    : "?";
  const creatorAvatar = commentAuthor?.avatar || "";
  const commentDate = commentThread?.createdAt || (comment as any)?.createdAt;

  const getPositioning = () => {
    const dropdownWidth = 420;
    const dropdownHeight = 400;
    let left = position.x;
    let top = position.y;
    
    if (left + dropdownWidth > position.containerRight) {
      left = position.x - dropdownWidth;
    }
    if (left < position.containerLeft) {
      left = position.containerLeft + 10;
    }
    
    // Vertical positioning - check available space above and below
    const spaceAbove = position.y - position.containerTop;
    const spaceBelow = position.containerBottom - position.y;
    
    // Determine best vertical position
    if (spaceBelow >= dropdownHeight) {
      top = position.y + 10;
    } else if (spaceAbove >= dropdownHeight) {
      top = position.y - dropdownHeight - 10;
    } else {
      if (spaceAbove > spaceBelow) {
        top = position.containerTop + 10;
      } else {
        top = position.containerBottom - dropdownHeight - 10;
      }
    }
    
    // Final boundary checks
    if (top < position.containerTop) {
      top = position.containerTop + 10;
    }
    if (top + dropdownHeight > position.containerBottom) {
      top = position.containerBottom - dropdownHeight - 10;
    }
    if (left < position.containerLeft) {
      left = position.containerLeft + 10;
    }
    if (left + dropdownWidth > position.containerRight) {
      left = position.containerRight - dropdownWidth - 10;
    }
    
    return { left, top };
  };

  const { left, top } = getPositioning();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-[1099] transition-opacity duration-200"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className="fixed w-[420px] bg-white rounded-xl border border-zinc-200/80 shadow-2xl z-[1100] max-h-[400px] flex flex-col overflow-hidden backdrop-blur-sm"
        style={{ 
          left: `${left}px`, 
          top: `${top}px`,
          animation: "slideIn 0.2s ease-out"
        }}
      >
        <style jsx>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>

        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 ring-2 ring-zinc-100">
              <AvatarImage src={creatorAvatar} />
              <AvatarFallback className="text-sm font-medium bg-zinc-100 text-zinc-700">
                {creatorInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-zinc-900 text-sm">
                {isNewComment ? "Add a comment" : creatorName}
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Clock className="w-3 h-3" />
                {isNewComment ? "New comment" : formatDate(commentDate)}
              </div>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-zinc-400 hover:text-zinc-600 transition-colors p-1 rounded-md hover:bg-zinc-100"
            aria-label="Close comment dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content area */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto" 
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(156, 163, 175, 0.2) transparent',
          }}
        >
          {/* <style jsx>{`
            .flex-1.overflow-y-auto::-webkit-scrollbar {
              width: 2px;
            }
            .flex-1.overflow-y-auto::-webkit-scrollbar-track {
              background: transparent;
            }
            .flex-1.overflow-y-auto::-webkit-scrollbar-thumb {
              background: rgba(156, 163, 175, 0.2);
              border-radius: 1px;
            }
            .flex-1.overflow-y-auto::-webkit-scrollbar-thumb:hover {
              background: rgba(156, 163, 175, 0.4);
            }
          `}</style> */}

          {/* Loading state */}
          {storeLoading && !isNewComment && (
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 text-zinc-500">
                <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></div>
                Loading comment details...
              </div>
            </div>
          )}

          {/* Comment content - only show for existing comments */}
          {!isNewComment && commentContent && !storeLoading && (
            <div className="px-5 py-4">
              <div className="text-zinc-800 text-sm leading-relaxed bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                {commentContent}
              </div>
            </div>
          )}

          {/* Replies section - only show for existing comments */}
          {!isNewComment && allReplies.length > 0 && !storeLoading && (
            <div className="px-5">
              <div className="flex items-center gap-2 mb-3 text-xs text-zinc-500">
                <MessageCircle className="w-3 h-3" />
                <span>{allReplies.length} {allReplies.length === 1 ? "reply" : "replies"}</span>
              </div>
              
              <div className="space-y-4 overflow-y-auto pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* <style jsx>{`
                  .space-y-4::-webkit-scrollbar {
                    display: none;
                  }
                `}</style> */}
                {allReplies.map((reply) => {
                  const replyAuthor = reply.author;
                  const replyAvatar = replyAuthor?.avatar || "";
                  const replyName = `${replyAuthor?.firstName || ""} ${replyAuthor?.lastName || ""}`.trim();
                  const replyInitials = getUserInitials(replyAuthor?.firstName, replyAuthor?.lastName);
                  
                  return (
                    <div key={reply._id} className={`flex gap-3 ${reply._id.startsWith('optimistic-') ? 'opacity-70' : ''}`}>
                      <div className="flex-shrink-0">
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={replyAvatar} />
                          <AvatarFallback className="text-xs">
                            {replyInitials}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium text-zinc-900 text-xs">
                            {replyName}
                          </div>
                          <div className="text-xs text-zinc-400">
                            {formatDate(reply.createdAt)}
                          </div>
                          {reply._id.startsWith('optimistic-') && (
                            <div className="text-xs text-zinc-400">
                              • Sending...
                            </div>
                          )}
                        </div>
                        <div className="text-zinc-700 text-sm leading-relaxed">
                          {reply.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reply button - only show for existing comments */}
          {!isNewComment && !showInput && !storeLoading && allReplies.length > 0 && (
            <div className="px-5 py-3 border-t border-zinc-100">
              {showSuccess && (
                <div className="mb-2 text-xs text-green-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Reply sent successfully
                </div>
              )}
              <button
                className="text-zinc-600 hover:text-zinc-900 text-sm font-medium transition-colors"
                onClick={() => setShowInput(true)}
              >
                Reply
              </button>
            </div>
          )}

          {/* Input section */}
          {showInput && (
            <div className="px-5 py-4 border-t border-zinc-100 bg-zinc-50/50">
              <TipTapEditor
                key={editorKey}
                collaborators={collaborators}
                content={input}
                onChange={setInput}
                placeholder={isNewComment ? "Type your comment and use @ to mention…" : "Type your reply or tag someone with @..."}
              />
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-zinc-400">
                  Press ⌘+Enter to send
                </div>
                <div className="flex gap-3">
                  <button
                    className="text-zinc-500 hover:text-zinc-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-zinc-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[80px] justify-center"
                    onClick={handleSend}
                    disabled={!input.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending</span>
                      </>
                    ) : (
                      isNewComment ? "Comment" : "Reply"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
