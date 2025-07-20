"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  className,
  disabled = false,
}: OTPInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (index: number, digit: string) => {
    if (disabled) return;

    // Only allow single digits
    if (digit.length > 1) return;

    // Update the value
    const newValue = value.split("");
    newValue[index] = digit;
    const newValueString = newValue.join("").slice(0, length);
    onChange(newValueString);

    // Move to next input if digit was entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    // Handle backspace
    if (e.key === "Backspace") {
      if (value[index] === "") {
        // If current field is empty, go to previous field
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        // Clear current field
        const newValue = value.split("");
        newValue[index] = "";
        onChange(newValue.join(""));
      }
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;

    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "");
    const digits = pastedData.slice(0, length).split("");
    
    if (digits.length > 0) {
      const newValue = Array(length).fill("").map((_, i) => digits[i] || "");
      onChange(newValue.join(""));
      
      // Focus the next empty field or the last field
      const nextIndex = Math.min(digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "h-12 w-12 text-center text-lg font-semibold border rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200"
          )}
        />
      ))}
    </div>
  );
} 