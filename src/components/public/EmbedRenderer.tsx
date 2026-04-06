import { type SocialPlatform } from "@/types/links";

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
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    );
  }

  if (platform === "spotify") {
    const spotifyUrl = embedSource.includes("embed") ? embedSource : embedSource.replace("open.spotify.com/", "open.spotify.com/embed/");
    return (
      <div className="w-full rounded-xl overflow-hidden">
        <iframe
          src={spotifyUrl}
          title={title}
          className="w-full h-[152px] md:h-[352px] border-0"
          loading="lazy"
        />
      </div>
    );
  }

  if (platform === "apple-music") {
    const appleUrl = embedSource.includes("embed") ? embedSource : embedSource.replace("music.apple.com/", "embed.music.apple.com/");
    return (
      <div className="w-full rounded-xl overflow-hidden">
        <iframe
          src={appleUrl}
          title={title}
          className="w-full h-[175px] md:h-[450px] border-0"
          loading="lazy"
          allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
        />
      </div>
    );
  }

  if (platform === "soundcloud") {
    const scUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(embedSource)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`;
    return (
      <div className="w-full rounded-xl overflow-hidden">
        <iframe
          src={scUrl}
          title={title}
          className="w-full h-[166px] border-0"
          loading="lazy"
        />
      </div>
    );
  }

  if (platform === "calendly") {
    return (
      <div className="w-full rounded-xl overflow-hidden border border-border/20 bg-card/10" style={{ height: 600 }}>
        <iframe
          src={`${embedSource}?embed_domain=${window.location.hostname}&embed_type=inline`}
          title={title}
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>
    );
  }

  if (platform === "twitch") {
    const channel = embedSource.split("/").pop();
    return (
      <div className="w-full rounded-xl overflow-hidden aspect-video bg-black">
        <iframe
          src={`https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&autoplay=false`}
          title={title}
          className="w-full h-full border-0"
          allowFullScreen
        />
      </div>
    );
  }

  if (platform === "kick") {
    const channel = embedSource.split("/").pop();
    return (
      <div className="w-full rounded-xl overflow-hidden aspect-video bg-black">
        <iframe
          src={`https://player.kick.com/${channel}`}
          title={title}
          className="w-full h-full border-0"
          allowFullScreen
        />
      </div>
    );
  }

  if (platform === "substack" || platform === "typeform") {
    return (
      <div className="w-full rounded-xl overflow-hidden bg-card/10" style={{ height: 500 }}>
        <iframe
          src={embedSource}
          title={title}
          className="w-full h-full border-0"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    );
  }

  return null;
};

export default EmbedRenderer;
