// TipTapEditor.tsx
"use client";
import React, { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";

interface TipTapEditorProps {
  collaborators: { id: string; firstName: string }[];
  onChange: (value: string) => void;
  content: string;
  placeholder?: string;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  collaborators,
  onChange,
  content,
  placeholder = "Type your comment here...",
}) => {
  const [isMentionOpen, setIsMentionOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const mentionCommandRef = useRef<any>(null);
  const mentionItemsRef = useRef<{ id: string; label: string }[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention bg-blue-100 text-blue-800 px-1 rounded",
        },
        suggestion: {
          items: ({ query }) => {
            const items = collaborators
              .filter((c) =>
                c.firstName.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5)
              .map((c) => ({
                id: c.id,
                label: c.firstName,
              }));
            mentionItemsRef.current = items;
            return items;
          },
          render: () => {
            return {
              onStart: (props) => {
                mentionCommandRef.current = props.command;
                if (props.clientRect) {
                  const rect = props.clientRect();
                  setDropdownPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                  });
                }
                setIsMentionOpen(true);
              },
              onUpdate: (props) => {
                const items = props.items;
                mentionItemsRef.current = items;
                if (props.clientRect) {
                  const rect = props.clientRect();
                  setDropdownPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                  });
                }
              },
              onExit: () => {
                setIsMentionOpen(false);
              },
            };
          },
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const handleMentionSelect = (item: { id: string; label: string }) => {
    if (mentionCommandRef.current) {
      mentionCommandRef.current({ id: item.id, label: item.label });
    }
    setIsMentionOpen(false);
  };

  return (
    <div className="relative">
      <EditorContent
        editor={editor}
        className="w-full resize-none bg-zinc-50 text-sm text-zinc-800 rounded-lg border border-zinc-200 p-3 outline-none h-[100px] focus:outline-none focus:ring-0 focus-within:outline-none focus-within:ring-0 [&_.ProseMirror]:outline-none [&_.ProseMirror]:ring-0 [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:focus:ring-0 [&_.ProseMirror]:border-none [&_.ProseMirror]:shadow-none [&_.ProseMirror]:h-full [&_.ProseMirror]:overflow-y-auto [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-zinc-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
      />
      
      {isMentionOpen && mentionItemsRef.current.length > 0 && (
        <div 
          className="fixed z-50 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto min-w-32"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
        >
          {mentionItemsRef.current.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMentionSelect(item)}
              className="w-full text-left px-3 py-2 hover:bg-zinc-100 text-sm"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
