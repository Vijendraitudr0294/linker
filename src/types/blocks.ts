
export type BlockType = 
  | 'header' 
  | 'social_icons' 
  | 'link' 
  | 'video' 
  | 'article' 
  | 'product' 
  | 'gallery' 
  | 'text'
  | 'contact_form'
  | 'music'
  | 'calendly'
  | 'substack'
  | 'tip_jar'
  | 'social_feed';

export interface BlockConfig {
  layout?: 'default' | 'classic' | 'featured' | 'grid';
  style?: Record<string, string>;
  title?: string;
  subtitle?: string;
  url?: string;
  media_url?: string;
  price?: number;
  price_label?: string;
  platform?: string;
  items?: BlockConfig[]; // For nested lists like Social Icons
}

export interface ProfileBlock {
  id: string;
  type: BlockType;
  enabled: boolean;
  sort_order: number;
  config: BlockConfig;
}
