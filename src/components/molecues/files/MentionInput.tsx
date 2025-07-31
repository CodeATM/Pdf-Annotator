// MentionInput.tsx
import React from "react";
import { MentionsInput, Mention } from "react-mentions";

// Example collaborators data (replace with real data in production)
const collaborators = [
  { id: "1", display: "Alice" },
  { id: "2", display: "Bob" },
  { id: "3", display: "Charlie" },
];

interface MentionInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
}) => (
  <MentionsInput
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={className}
    style={{
      control: {
        fontSize: 14,
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 6,
        padding: 8,
      },
      highlighter: {
        overflow: "hidden",
      },
      input: {
        margin: 0,
      },
      suggestions: {
        list: {
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          fontSize: 14,
        },
        item: {
          padding: "5px 15px",
          borderBottom: "1px solid #f3f4f6",
          cursor: "pointer",
        },
      },
    }}
  >
    <Mention
      trigger="@"
      data={collaborators}
      markup="@__display__"
      displayTransform={(id, display) => `@${display}`}
      className="bg-orange-100 text-orange-700 rounded px-1"
    />
  </MentionsInput>
); 