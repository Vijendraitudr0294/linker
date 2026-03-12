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
  type LucideIcon,
} from "lucide-react";
import type { SocialPlatform } from "@/stores/linksStore";

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

export const EMBED_PLATFORMS: SocialPlatform[] = ["video-embed", "website-embed", "google-maps"];

export const isEmbedPlatform = (platform: SocialPlatform) => EMBED_PLATFORMS.includes(platform);

export const platformOptions: { value: SocialPlatform; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "video-embed", label: "Video Embed" },
  { value: "website-embed", label: "Website Embed" },
  { value: "google-maps", label: "Google Maps" },
  { value: "googlemeet", label: "Google Meet" },
  { value: "zoom", label: "Zoom" },
  { value: "calendly", label: "Calendly" },
  { value: "calcom", label: "Cal.com" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter/X" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "spotify", label: "Spotify" },
  { value: "twitch", label: "Twitch" },
  { value: "discord", label: "Discord" },
  { value: "snapchat", label: "Snapchat" },
  { value: "pinterest", label: "Pinterest" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telegram", label: "Telegram" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
];
