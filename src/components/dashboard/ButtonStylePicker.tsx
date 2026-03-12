import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AppearanceSettings } from "@/stores/appearanceStore";

type ButtonStyleOption = AppearanceSettings["buttonStyle"];

interface ButtonStylePickerProps {
  currentStyle: ButtonStyleOption;
  onSelect: (style: ButtonStyleOption) => void;
  buttonBg: string;
  buttonText: string;
}

const styles: { value: ButtonStyleOption; label: string; preview: string }[] = [
  { value: "rounded", label: "Rounded", preview: "rounded-lg" },
  { value: "pill", label: "Pill", preview: "rounded-full" },
  { value: "square", label: "Square", preview: "rounded-none" },
  { value: "outline", label: "Outline", preview: "rounded-lg" },
  { value: "shadow", label: "Shadow", preview: "rounded-lg" },
];

const ButtonStylePicker = ({ currentStyle, onSelect, buttonBg, buttonText }: ButtonStylePickerProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-base font-heading font-semibold">Button Style</Label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {styles.map((s) => {
          const isSelected = currentStyle === s.value;
          const isOutline = s.value === "outline";
          const isShadow = s.value === "shadow";
          return (
            <button
              key={s.value}
              onClick={() => onSelect(s.value)}
              className={cn(
                "flex flex-col items-center gap-2.5 p-3.5 rounded-2xl border-2 transition-all",
                isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border/40 bg-card/40 hover:border-primary/30"
              )}
            >
              {/* Mini button preview */}
              <div
                className={cn("w-full h-10 flex items-center justify-center text-[11px] font-bold transition-all px-2", s.preview)}
                style={{
                  backgroundColor: isOutline ? "transparent" : buttonBg,
                  color: isOutline ? buttonBg : buttonText,
                  border: isOutline ? `2px solid ${buttonBg}` : "none",
                  boxShadow: isShadow ? `0 6px 16px -3px ${buttonBg}60` : "none",
                }}
              >
                Link
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ButtonStylePicker;
