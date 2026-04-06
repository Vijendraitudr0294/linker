
import { ProfileBlock, BlockConfig } from "@/types/blocks";

export const mapLinksToBlocks = (links: any[]): ProfileBlock[] => {
  return links.map(link => {
    const [platform, layout] = (link.platform || "website").split("|");
    
    // Determine block type from layout/platform
    let type: any = 'link';
    if (layout === 'video') type = 'video';
    if (layout === 'article') type = 'article';

    return {
      id: link.id,
      type,
      enabled: link.enabled !== false,
      sort_order: link.sort_order || 0,
      config: {
        title: link.title,
        url: link.url,
        platform: platform,
        media_url: getMediaThumbnail(link.url, type)
      }
    };
  });
};

export const mapCatalogToBlocks = (items: any[]): ProfileBlock[] => {
  return items.map(item => ({
    id: item.id,
    type: 'product',
    enabled: item.enabled !== false,
    sort_order: item.sort_order || 0,
    config: {
      title: item.title,
      subtitle: item.description,
      price: item.price,
      price_label: item.price_label,
      media_url: item.image_url,
      url: item.external_url
    }
  }));
};

const getMediaThumbnail = (url: string, type: string) => {
  if (!url) return "";
  
  if (type === 'video') {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
        const v = u.searchParams.get("v") || u.pathname.split("/").pop();
        if (v) return `https://img.youtube.com/vi/${v}/maxresdefault.jpg`;
      }
      if (u.hostname.includes("vimeo.com")) {
        const v = u.pathname.split("/").pop();
        if (v) return `https://vumbnail.com/${v}.jpg`;
      }
    } catch {}
    return "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80";
  }
  
  if (type === 'article') {
    try {
      const u = new URL(url);
      return `https://unavatar.io/${u.hostname}?fallback=false`;
    } catch {}
    return "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=800&q=80";
  }

  return "";
};

export const sortBlocks = (blocks: ProfileBlock[]) => {
  return [...blocks].sort((a, b) => a.sort_order - b.sort_order);
};
