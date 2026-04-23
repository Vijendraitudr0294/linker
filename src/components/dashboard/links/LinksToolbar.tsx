import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutList, LayoutGrid, Search, X } from "lucide-react";
import { SocialIcon, platformOptions } from "@/components/SocialIcon";
import { type SocialPlatform } from "@/types/links";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

type StatusFilter = "all" | "active" | "disabled";
export type ViewMode = "list" | "card";

type LinksToolbarProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  linksCount: number;
  visibleCount: number;
  filteredCount: number;
  searchQuery: string;
  statusFilter: StatusFilter;
  platformFilter: SocialPlatform | "all";
  platformCounts: Record<string, number>;
  onSearchQueryChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onPlatformFilterChange: (value: SocialPlatform | "all") => void;
  onClearFilters: () => void;
};

export default function LinksToolbar({
  viewMode,
  onViewModeChange,
  linksCount,
  visibleCount,
  filteredCount,
  searchQuery,
  statusFilter,
  platformFilter,
  platformCounts,
  onSearchQueryChange,
  onStatusFilterChange,
  onPlatformFilterChange,
  onClearFilters,
}: LinksToolbarProps) {
  const hasFilters = searchQuery.trim().length > 0 || statusFilter !== "all" || platformFilter !== "all";

  return (
    <Card className="p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search by title or URL..."
            className="pl-10 h-10 rounded-xl border-border/50"
          />
        </div>

        <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as StatusFilter)}>
          <SelectTrigger className="w-full md:w-44 h-10 rounded-xl border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="disabled">Disabled Only</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex bg-muted/30 p-1 rounded-xl border border-border/40 shrink-0">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-8 px-3 rounded-lg gap-2 text-[10px] font-medium text-sm",
              viewMode === "list" ? "bg-white border border-black/10 shadow-sm text-black" : "text-muted-foreground"
            )}
            onClick={() => onViewModeChange("list")}
          >
            <LayoutList className="w-3.5 h-3.5" />
            List
          </Button>
          <Button
            variant={viewMode === "card" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-8 px-3 rounded-lg gap-2 text-[10px] font-medium text-sm",
              viewMode === "card" ? "bg-white border border-black/10 shadow-sm text-black" : "text-muted-foreground"
            )}
            onClick={() => onViewModeChange("card")}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Card
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => onPlatformFilterChange("all")}
          className={`px-3 h-8 rounded-full text-xs font-bold border whitespace-nowrap transition-all ${
            platformFilter === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-border/60 hover:border-primary/40"
          }`}
        >
          All ({linksCount})
        </button>

        {platformOptions
          .filter((platform) => (platformCounts[platform.value] || 0) > 0)
          .map((platform) => (
            <button
              key={platform.value}
              onClick={() => onPlatformFilterChange(platform.value)}
              className={`px-3 h-8 rounded-full text-xs font-bold border whitespace-nowrap transition-all inline-flex items-center gap-1.5 ${
                platformFilter === platform.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border/60 hover:border-primary/40"
              }`}
            >
              <SocialIcon platform={platform.value} className="w-3.5 h-3.5" />
              {platform.label} ({platformCounts[platform.value]})
            </button>
          ))}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs text-muted-foreground font-medium">
          Showing {visibleCount} of {filteredCount} links
          {filteredCount !== linksCount ? ` (total ${linksCount})` : ""}
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-8 rounded-lg" onClick={onClearFilters}>
            <X className="w-3.5 h-3.5 mr-1" /> Clear filters
          </Button>
        )}
      </div>
    </Card>
  );
}

