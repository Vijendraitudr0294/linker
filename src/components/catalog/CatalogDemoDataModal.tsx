import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, Database, Plus, Loader2 } from "lucide-react";

interface CatalogDemoDataModalProps {
  demoCategories: string[];
  demoCatalogPacks: Record<string, any[]>;
  importingDemo: boolean;
  onBulkAdd: (category: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CatalogDemoDataModal({
  demoCategories,
  demoCatalogPacks,
  importingDemo,
  onBulkAdd,
  open,
  onOpenChange,
}: CatalogDemoDataModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 border-primary/20 hover:bg-primary/5 text-primary">
          <Sparkles className="w-4 h-4" /> Load Demo Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" /> Load Sample Catalog
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose a niche to pre-populate your catalog with 8 high-quality sample items including images, descriptions, and prices.
          </p>
          <div className="grid grid-cols-1 gap-2">
            {demoCategories.map((cat) => (
              <Button
                key={cat}
                variant="outline"
                className="justify-start h-12 text-left hover:border-primary/50 hover:bg-primary/5 transition-all group"
                onClick={() => onBulkAdd(cat)}
                disabled={importingDemo}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{cat}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {demoCatalogPacks[cat]?.length || 0} Items
                    </span>
                    <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Button>
            ))}
          </div>
          {importingDemo && (
            <div className="flex items-center justify-center gap-2 text-primary text-sm py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Importing catalog...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
