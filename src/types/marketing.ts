export interface MarketingSection {
  id: string;
  type: 'hero' | 'features' | 'use-cases' | 'how-it-works' | 'pricing' | 'cta' | 'preview' | 'testimonials' | 'team' | 'contact' | 'blog' | 'faq';
  enabled: boolean;
  content: any;
  order: number;
}

export interface MarketingPage {
  slug: string; // 'home', 'features', 'pricing', etc.
  title: string;
  description: string;
  sections: MarketingSection[];
}

export interface SiteConfig {
  active_theme: string;
  navigation: {
    label: string;
    href: string;
  }[];
  footer: {
    columns: {
      title: string;
      links: { label: string; href: string }[];
    }[];
  };
}
