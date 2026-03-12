import type { SocialPlatform } from "@/stores/linksStore";

interface EmbedRendererProps {
  url: string;
  platform: SocialPlatform;
  title: string;
}

const getYouTubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/);
  return match?.[1] || null;
};

const getVimeoId = (url: string) => {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match?.[1] || null;
};

const getGoogleMapsEmbedUrl = (url: string) => {
  if (url.includes("/embed")) return url;
  // Convert share link to embed
  const placeMatch = url.match(/place\/([^/]+)/);
  if (placeMatch) {
    return `https://www.google.com/maps/embed/v1/place?key=&q=${encodeURIComponent(placeMatch[1])}`;
  }
  // For @lat,lng URLs or generic maps URLs, use iframe src directly
  if (url.includes("google.com/maps")) {
    return `https://maps.google.com/maps?output=embed&q=${encodeURIComponent(url)}`;
  }
  return url;
};

const EmbedRenderer = ({ url, platform, title }: EmbedRendererProps) => {
  if (platform === "video-embed") {
    const ytId = getYouTubeId(url);
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
    const vimeoId = getVimeoId(url);
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
    // Generic video embed
    return (
      <div className="w-full rounded-xl overflow-hidden aspect-video">
        <iframe src={url} title={title} className="w-full h-full" allowFullScreen />
      </div>
    );
  }

  if (platform === "google-maps") {
    const embedUrl = getGoogleMapsEmbedUrl(url);
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
        <iframe src={url} title={title} className="w-full h-full border-0" loading="lazy" sandbox="allow-scripts allow-same-origin" />
      </div>
    );
  }

  return null;
};

export default EmbedRenderer;
