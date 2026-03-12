import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LinkTemplate, LinkTemplateCategory } from "@/lib/linkTemplates";

type TemplatePickerProps = {
  categories: LinkTemplateCategory[];
  templateCategoryId: string;
  templateId: string;
  templateSearch: string;
  selectedTemplateCategory?: LinkTemplateCategory;
  selectedTemplate?: LinkTemplate;
  onCategoryChange: (value: string) => void;
  onTemplateSelect: (value: string) => void;
  onTemplateSearchChange: (value: string) => void;
  onTemplateClear: () => void;
};

export default function TemplatePicker({
  categories,
  templateCategoryId,
  templateId,
  templateSearch,
  selectedTemplateCategory,
  selectedTemplate,
  onCategoryChange,
  onTemplateSelect,
  onTemplateSearchChange,
  onTemplateClear,
}: TemplatePickerProps) {
  const filteredTemplates = (selectedTemplateCategory?.templates ?? []).filter((template) => {
    const query = templateSearch.trim().toLowerCase();
    if (!query) return true;
    return template.title.toLowerCase().includes(query) || template.tag.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-3 rounded-xl border border-border/50 bg-background/40 p-3">
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Template Category</Label>
        <Select value={templateCategoryId} onValueChange={onCategoryChange}>
          <SelectTrigger className="rounded-xl h-11 border-border/50">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Choose category</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTemplateCategory && (
        <>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Search Feature</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={templateSearch}
                onChange={(e) => onTemplateSearchChange(e.target.value)}
                placeholder="Search within this category..."
                className="pl-10 h-10 rounded-xl border-border/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-tight opacity-70">Feature Templates</Label>
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {filteredTemplates.map((template) => {
                  const isActive = templateId === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => onTemplateSelect(template.id)}
                      className={`text-left rounded-xl border p-2.5 transition-all ${
                        isActive
                          ? "border-primary bg-primary/10"
                          : "border-border/60 bg-background/70 hover:border-primary/40"
                      }`}
                      type="button"
                    >
                      <p className="text-sm font-semibold text-foreground">{template.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">#{template.tag}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No templates found in this category for your search.</p>
            )}
          </div>
        </>
      )}

      {selectedTemplate && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 p-2.5">
          <p className="text-xs text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Template applied: <span className="font-semibold">{selectedTemplate.title}</span>
          </p>
          <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={onTemplateClear}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

