// Color Picker Component
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
    const colors = [
      { label: "Yellow", value: "rgba(255, 235, 60, 0.5)" },
      { label: "Green", value: "rgba(76, 175, 80, 0.5)" },
      { label: "Blue", value: "rgba(33, 150, 243, 0.5)" },
      { label: "Pink", value: "rgba(233, 30, 99, 0.5)" },
      { label: "Orange", value: "rgba(255, 152, 0, 0.5)" },
      { label: "Purple", value: "rgba(156, 39, 176, 0.5)" },
    ];
  
    return (
      <div className="relative">
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-zinc-200 p-2 z-50">
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    selectedColor === color.value
                      ? "border-zinc-500 scale-110 shadow-md"
                      : "border-transparent hover:border-zinc-300"
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => {
                    onColorSelect(color.value);
                    setIsOpen(false);
                  }}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };