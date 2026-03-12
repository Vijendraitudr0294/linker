ALTER TABLE public.catalog_items 
ADD COLUMN IF NOT EXISTS duration text DEFAULT '',
ADD COLUMN IF NOT EXISTS schedule text DEFAULT '',
ADD COLUMN IF NOT EXISTS location text DEFAULT '';