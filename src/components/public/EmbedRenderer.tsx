import type { SocialPlatform } from "@/stores/linksStore";

interface EmbedRendererProps {
  url: string;
  platform: SocialPlatform;
  title: string;
}

const EMBED_SRC_PATTERN = /<iframe[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i;

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

const normalizeEmbedInput = (value: string): string => {
  const trimmed = decodeHtmlEntities(value || "").trim();
  if (!trimmed) return "";

  const match = trimmed.match(EMBED_SRC_PATTERN);
  const src = (match?.[1] || match?.[2] || match?.[3] || "").trim();
  const candidate = src || trimmed;

  if (candidate.startsWith("//")) {
    return `https:${candidate}`;
  }

  return candidate;
};

const getYouTubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/i);
  return match?.[1] || null;
};

const getVimeoId = (url: string) => {
  const match = url.match(/vimeo\.com\/(\d+)/i);
  return match?.[1] || null;
};

const getGoogleMapsEmbedUrl = (url: string) => {
  if (url.includes("/embed")) return url;
  const placeMatch = url.match(/place\/([^/]+)/);
  if (placeMatch) {
    return `https://www.google.com/maps/embed/v1/place?key=&q=${encodeURIComponent(placeMatch[1])}`;
  }
  if (url.includes("google.com/maps")) {
    return `https://maps.google.com/maps?output=embed&q=${encodeURIComponent(url)}`;
  }
  return url;
};

const EmbedRenderer = ({ url, platform, title }: EmbedRendererProps) => {
  const embedSource = normalizeEmbedInput(url);

  if (!embedSource) return null;

  if (platform === "video-embed") {
    const ytId = getYouTubeId(embedSource);
    if (ytId) {
      return (
        <div className="w-full rounded-xl overflow-hidden aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    const vimeoId = getVimeoId(embedSource);
    if (vimeoId) {
      return (
        <div className="w-full rounded-xl overflow-hidden aspect-video">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}`}
            title={title}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <div className="w-full rounded-xl overflow-hidden aspect-video">
        <iframe src={embedSource} title={title} className="w-full h-full" allowFullScreen />
      </div>
    );
  }

  if (platform === "google-maps") {
    const embedUrl = getGoogleMapsEmbedUrl(embedSource);
    return (
      <div className="w-full rounded-xl overflow-hidden" style={{ height: 250 }}>
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  if (platform === "website-embed") {
    return (
      <div className="w-full rounded-xl overflow-hidden" style={{ height: 350 }}>
        <iframe
          src={embedSource}
          title={title}
          className="w-full h-full border-0"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    );
  }

  return null;
};

export default EmbedRenderer;
