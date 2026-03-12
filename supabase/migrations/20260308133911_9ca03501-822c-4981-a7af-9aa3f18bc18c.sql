
-- Catalog items table for marketplace (products, menus, services, digital)
CREATE TABLE public.catalog_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10,2),
  price_label TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'product',
  item_type TEXT NOT NULL DEFAULT 'physical',
  tags TEXT[] DEFAULT '{}',
  external_url TEXT DEFAULT '',
  allow_order_form BOOLEAN NOT NULL DEFAULT false,
  enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;

-- Public can view enabled items
CREATE POLICY "Catalog items are publicly viewable"
ON public.catalog_items FOR SELECT
USING (enabled = true OR auth.uid() = user_id);

-- Owners can insert
CREATE POLICY "Users can insert own catalog items"
ON public.catalog_items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Owners can update
CREATE POLICY "Users can update own catalog items"
ON public.catalog_items FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Owners can delete
CREATE POLICY "Users can delete own catalog items"
ON public.catalog_items FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Orders table
CREATE TABLE public.catalog_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.catalog_items(id) ON DELETE CASCADE,
  profile_user_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.catalog_orders ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an order
CREATE POLICY "Anyone can submit orders"
ON public.catalog_orders FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Profile owners can view their orders
CREATE POLICY "Users can view own orders"
ON public.catalog_orders FOR SELECT
TO authenticated
USING (auth.uid() = profile_user_id);

-- Profile owners can update order status
CREATE POLICY "Users can update own orders"
ON public.catalog_orders FOR UPDATE
TO authenticated
USING (auth.uid() = profile_user_id);

-- Profile owners can delete orders
CREATE POLICY "Users can delete own orders"
ON public.catalog_orders FOR DELETE
TO authenticated
USING (auth.uid() = profile_user_id);
