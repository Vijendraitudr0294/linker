
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to auto-create notifications on new messages
CREATE OR REPLACE FUNCTION public.notify_on_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  VALUES (
    NEW.profile_user_id,
    'message',
    'New message from ' || NEW.sender_name,
    LEFT(NEW.message, 100),
    jsonb_build_object('message_id', NEW.id, 'sender_name', NEW.sender_name)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_contact_message
  AFTER INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_message();

-- Function to auto-create notifications on new orders
CREATE OR REPLACE FUNCTION public.notify_on_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  VALUES (
    NEW.profile_user_id,
    'order',
    'New order from ' || NEW.customer_name,
    'Order #' || LEFT(NEW.id::text, 8),
    jsonb_build_object('order_id', NEW.id, 'customer_name', NEW.customer_name)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_catalog_order
  AFTER INSERT ON public.catalog_orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_order();

-- Function to auto-create notifications on profile views (batched - every 10th view)
CREATE OR REPLACE FUNCTION public.notify_on_profile_view()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  view_count integer;
BEGIN
  SELECT COUNT(*) INTO view_count FROM public.profile_views WHERE profile_user_id = NEW.profile_user_id;
  IF view_count % 10 = 0 THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.profile_user_id,
      'view',
      'Your profile is trending! 🔥',
      view_count || ' people have viewed your profile',
      jsonb_build_object('view_count', view_count)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_view_milestone
  AFTER INSERT ON public.profile_views
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_profile_view();

