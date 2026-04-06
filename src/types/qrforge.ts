export type QRType = "url" | "text" | "email" | "phone" | "sms" | "wifi" | "vcard" | "location" | "instagram" | "apps" | "vcard_plus" | "coupon" | "social_links" | "feedback";

export interface QRCodeItem {
  id: string;
  user_id: string;
  name: string;
  type: QRType;
  mode: "static" | "dynamic";
  content: string;
  short_code: string | null;
  fg_color: string;
  bg_color: string;
  logo_url: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  scans_count?: number; // Aggregated on read or lookup
}
