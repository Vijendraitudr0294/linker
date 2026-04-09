export type SocialPlatform = 
  | "instagram" | "twitter" | "youtube" | "tiktok" | "facebook" 
  | "linkedin" | "github" | "spotify" | "twitch" | "discord" 
  | "snapchat" | "pinterest" | "whatsapp" | "telegram" | "email" 
  | "website" | "googlemeet" | "zoom" | "calendly" | "calcom"
  | "video-embed" | "website-embed" | "google-maps"
  | "apple-music" | "soundcloud" | "audiomack" | "substack" | "typeform"
  | "gofundme" | "kick" | "kickstarter" | "mixcloud" | "tidal" | "tunein"
  | "bandsintown" | "seated" | "songkick" | "airbnb" | "behance" | "imgur" | "laylo" | "matterport" | "shopmy" | "tip-jar"
  | "appstore" | "playstore"
  | "other";

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  enabled: boolean;
  platform: SocialPlatform;
  clicks: number;
  sort_order: number;
  user_id: string;
  layout?: "default" | "video" | "article" | string;
}
