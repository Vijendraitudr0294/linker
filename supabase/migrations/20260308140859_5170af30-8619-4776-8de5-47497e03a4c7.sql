
ALTER TABLE public.catalog_items 
ADD COLUMN variants jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.catalog_orders 
ADD COLUMN quantity integer NOT NULL DEFAULT 1,
ADD COLUMN selected_variant text DEFAULT '';
