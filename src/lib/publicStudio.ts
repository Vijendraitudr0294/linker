export interface StudioCardItem {
  id: string;
  type: "video" | "news" | "music" | "portfolio" | "broadcast";
  title: string;
  subtitle: string;
  url: string;
  thumbnail?: string;
  layoutStyle?: "classic" | "featured";
}

export interface StudioProfileState {
  pageMode?: "hybrid" | "links-only" | "content-only";
  sectionTitle?: string;
  sectionSubtitle?: string;
  showSection?: boolean;
  items?: StudioCardItem[];
}

export const parseStudioProfileState = (creatorMetrics: unknown): StudioProfileState | null => {
  if (!creatorMetrics || typeof creatorMetrics !== "object" || Array.isArray(creatorMetrics)) return null;
  const studioStateJson = (creatorMetrics as Record<string, unknown>).studio_state_json;
  if (typeof studioStateJson !== "string" || !studioStateJson.trim()) return null;

  try {
    const parsed = JSON.parse(studioStateJson) as { profile?: StudioProfileState };
    return parsed?.profile || null;
  } catch {
    return null;
  }
};
