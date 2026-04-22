-- Add customizable public profile tab labels
ALTER TABLE public.appearance_settings
  ADD COLUMN IF NOT EXISTS shop_tab_label text DEFAULT 'Shop',
  ADD COLUMN IF NOT EXISTS links_tab_label text DEFAULT 'Links';

UPDATE public.appearance_settings
SET
  shop_tab_label = COALESCE(NULLIF(shop_tab_label, ''), 'Shop'),
  links_tab_label = COALESCE(NULLIF(links_tab_label, ''), 'Links')
WHERE shop_tab_label IS NULL
   OR links_tab_label IS NULL
   OR shop_tab_label = ''
   OR links_tab_label = '';

