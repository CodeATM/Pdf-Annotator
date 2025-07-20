import { useRef } from "react";

// Expanded Material-inspired color palette
const PRESET_COLORS = [
  { label: "Yellow", value: "rgba(255, 235, 60, 0.5)" },
  { label: "Green", value: "rgba(76, 175, 80, 0.5)" },
  { label: "Blue", value: "rgba(33, 150, 243, 0.5)" },
  { label: "Pink", value: "rgba(233, 30, 99, 0.5)" },
  { label: "Orange", value: "rgba(255, 152, 0, 0.5)" },
  { label: "Purple", value: "rgba(156, 39, 176, 0.5)" },
  { label: "Red", value: "rgba(244, 67, 54, 0.5)" },
  { label: "Teal", value: "rgba(0, 150, 136, 0.5)" },
  { label: "Indigo", value: "rgba(63, 81, 181, 0.5)" },
  { label: "Lime", value: "rgba(205, 220, 57, 0.5)" },
  { label: "Cyan", value: "rgba(0, 188, 212, 0.5)" },
  { label: "Amber", value: "rgba(255, 193, 7, 0.5)" },
  { label: "Deep Orange", value: "rgba(255, 87, 34, 0.5)" },
  { label: "Deep Purple", value: "rgba(103, 58, 183, 0.5)" },
  { label: "Brown", value: "rgba(121, 85, 72, 0.5)" },
  { label: "Grey", value: "rgba(158, 158, 158, 0.5)" },
  { label: "Blue Grey", value: "rgba(96, 125, 139, 0.5)" },
  { label: "Black", value: "rgba(0, 0, 0, 0.5)" },
  { label: "White", value: "rgba(255, 255, 255, 0.5)" },
];

export const ColorPicker = ({
  selectedColor,
  onColorSelect,
  isOpen,
  setIsOpen,
}: {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Convert rgba to hex for the color input
  function rgbaToHex(rgba: string) {
    const match = rgba.match(/rgba?\((\d+), (\d+), (\d+),? ([\d.]+)?\)/);
    if (!match) return "#000000";
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  }

  // Convert hex to rgba with default alpha
  function hexToRgba(hex: string, alpha = 0.5) {
    let c = hex.replace("#", "");
    if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return (
    <div className="relative">
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 min-w-[260px] bg-white rounded-2xl shadow-2xl border border-zinc-200 p-5 z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-zinc-700">Choose Annotation Color</span>
            <button
              className="rounded-full p-1 hover:bg-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
              onClick={() => setIsOpen(false)}
              aria-label="Close color picker"
              tabIndex={0}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M6 14L14 6" stroke="#555" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-zinc-200 mb-4" />

          {/* Color Swatches */}
          <div className="grid grid-cols-6 gap-2 mb-4">
            {PRESET_COLORS.map((color) => {
              const isSelected = selectedColor === color.value;
              return (
                <button
                  key={color.value}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-accent/50
                    ${isSelected ? "border-accent scale-110 shadow-lg" : "border-zinc-200 hover:border-accent/60 hover:scale-105"}
                  `}
                  style={{ backgroundColor: color.value }}
                  onClick={() => {
                    onColorSelect(color.value);
                    setIsOpen(false);
                  }}
                  title={color.label}
                  aria-label={color.label}
                >
                  {isSelected && (
                    <span className="block w-3 h-3 rounded-full border-2 border-white bg-accent shadow" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom Color Picker */}
          <div className="flex items-center gap-3 mb-2">
            <label htmlFor="custom-color" className="text-xs text-zinc-500 font-medium">Custom</label>
            <input
              ref={colorInputRef}
              id="custom-color"
              type="color"
              className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer rounded-full shadow-inner hover:shadow focus:ring-2 focus:ring-accent/50"
              value={rgbaToHex(selectedColor)}
              onChange={(e) => {
                const rgba = hexToRgba(e.target.value);
                onColorSelect(rgba);
                setIsOpen(false);
              }}
              aria-label="Custom color picker"
            />
            <span className="ml-2 text-xs text-zinc-400 font-mono">{rgbaToHex(selectedColor)}</span>
          </div>
        </div>
      )}
    </div>
  );
};