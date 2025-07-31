import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CommentPinProps {
  x: number;
  y: number;
  latestMessage: string;
  author: string;
  onClick: () => void;
}

export const CommentPin: React.FC<CommentPinProps> = ({
  x, y, latestMessage, author, onClick
}) => {
  const [open, setOpen] = useState(false);
  const initial = author?.[0]?.toUpperCase() || "?";

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: 1000,
        cursor: "pointer",
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div 
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onClick={onClick}
          >
            <MessageCircle className="text-orange-500 hover:scale-110 transition" size={24} />
          </div>
        </PopoverTrigger>
        <PopoverContent side="right" align="center" className="w-64">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-6 h-6">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-xs text-zinc-700">{author}</span>
          </div>
          <div className="text-sm">{latestMessage}</div>
        </PopoverContent>
      </Popover>
    </div>
  );
}; 