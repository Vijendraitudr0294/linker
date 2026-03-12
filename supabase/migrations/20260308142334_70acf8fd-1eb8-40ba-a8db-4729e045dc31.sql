
CREATE OR REPLACE FUNCTION public.decrement_stock_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.catalog_items
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.item_id
    AND track_inventory = true
    AND stock_quantity IS NOT NULL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_decrement_stock_on_order
AFTER INSERT ON public.catalog_orders
FOR EACH ROW
EXECUTE FUNCTION public.decrement_stock_on_order();
