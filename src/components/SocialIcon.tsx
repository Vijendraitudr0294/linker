import {
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Linkedin,
  Github,
  Music2,
  Twitch,
  MessageCircle,
  Camera,
  Send,
  Mail,
  Globe,
  Link2,
  Video,
  Calendar,
  Play,
  Code,
  MapPin,
  DollarSign,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { type SocialPlatform } from "@/types/links";

const platformIcons: Record<SocialPlatform, LucideIcon> = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: Music2,
  facebook: Facebook,
  linkedin: Linkedin,
  github: Github,
  spotify: Music2,
  twitch: Twitch,
  discord: MessageCircle,
  snapchat: Camera,
  pinterest: Camera,
  whatsapp: MessageCircle,
  telegram: Send,
  email: Mail,
  website: Globe,
  googlemeet: Video,
  zoom: Video,
  calendly: Calendar,
  calcom: Calendar,
  "video-embed": Play,
  "website-embed": Code,
  "google-maps": MapPin,
  "apple-music": Music2,
  "soundcloud": Music2,
  "audiomack": Music2,
  "substack": Link2,
  "typeform": Link2,
  "gofundme": Link2,
  "kick": Play,
  "kickstarter": Link2,
  "mixcloud": Music2,
  "tidal": Music2,
  "tunein": Music2,
  "bandsintown": Calendar,
  "seated": Calendar,
  "songkick": Calendar,
  "airbnb": MapPin,
  "behance": Camera,
  "imgur": Camera,
  "laylo": Link2,
  "matterport": Link2,
  shopmy: Link2,
  "tip-jar": DollarSign,
  appstore: Smartphone,
  playstore: Smartphone,
  other: Link2,
};

interface SocialIconProps {
  platform: SocialPlatform;
  className?: string;
}

export const SocialIcon = ({ platform, className = "w-4 h-4" }: SocialIconProps) => {
  const Icon = platformIcons[platform] || platformIcons.other;
  return <Icon className={className} />;
};

export const EMBED_PLATFORMS: SocialPlatform[] = [
  "video-embed", "website-embed", "google-maps", "spotify", "apple-music", 
  "soundcloud", "audiomack", "substack", "typeform", "calendly", "calcom"
];

export const isEmbedPlatform = (platform: SocialPlatform) => EMBED_PLATFORMS.includes(platform);

export const platformOptions: { value: SocialPlatform; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "video-embed", label: "Video Embed" },
  { value: "website-embed", label: "Website Embed" },
  { value: "google-maps", label: "Google Maps" },
  { value: "spotify", label: "Spotify" },
  { value: "apple-music", label: "Apple Music" },
  { value: "soundcloud", label: "SoundCloud" },
  { value: "audiomack", label: "Audiomack" },
  { value: "substack", label: "Substack" },
  { value: "typeform", label: "Typeform" },
  { value: "calendly", label: "Calendly" },
  { value: "calcom", label: "Cal.com" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter/X" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "twitch", label: "Twitch" },
  { value: "discord", label: "Discord" },
  { value: "snapchat", label: "Snapchat" },
  { value: "pinterest", label: "Pinterest" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telegram", label: "Telegram" },
  { value: "email", label: "Email" },
  { value: "appstore", label: "App Store" },
  { value: "playstore", label: "Google Play" },
  { value: "other", label: "Other" },
];
