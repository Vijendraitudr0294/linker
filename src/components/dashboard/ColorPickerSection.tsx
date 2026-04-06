import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { AppearanceSettings } from "@/stores/appearanceStore";

interface ColorPickerSectionProps {
  settings: AppearanceSettings;
  updateSettings: (data: Partial<AppearanceSettings>) => Promise<void>;
}

const colorFields: { key: keyof AppearanceSettings; label: string }[] = [
  { key: "backgroundColor", label: "Background" },
  { key: "textColor", label: "Text" },
  { key: "buttonBg", label: "Button Background" },
  { key: "buttonText", label: "Button Text" },
];

const ColorPickerSection = ({ settings, updateSettings }: ColorPickerSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {colorFields.map(({ key, label }) => {
          const value = (settings[key] as string) || "#000000";
          // Only show hex color picker for valid hex values
          const isHex = /^#[0-9a-fA-F]{6}$/.test(value);
          return (
            <div key={key} className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">{label}</Label>
              <div className="flex items-center gap-2 bg-card/40 p-1 rounded-xl border border-border/40 focus-within:border-primary/30 transition-all">
                <div className="relative group">
                  <input
                    type="color"
                    value={isHex ? value : "#000000"}
                    onChange={(e) => updateSettings({ [key]: e.target.value } as Partial<AppearanceSettings>)}
                    className="w-8 h-8 rounded-lg border-none cursor-pointer bg-transparent overflow-hidden"
                    style={{ padding: 0 }}
                  />
                  <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10 pointer-events-none" />
                </div>
                <Input
                  value={value}
                  onChange={(e) => updateSettings({ [key]: e.target.value } as Partial<AppearanceSettings>)}
                  className="h-8 border-none bg-transparent text-[12px] font-mono focus-visible:ring-0 px-2"
                  placeholder="#000000"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColorPickerSection;
