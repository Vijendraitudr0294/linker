
ALTER TABLE public.catalog_items 
ADD COLUMN stock_quantity integer DEFAULT NULL,
ADD COLUMN track_inventory boolean NOT NULL DEFAULT false;

