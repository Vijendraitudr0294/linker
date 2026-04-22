
-- Update message notification trigger to check preferences
CREATE OR REPLACE FUNCTION public.notify_on_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  prefs jsonb;
BEGIN
  SELECT COALESCE(notification_prefs, '{"messages": true}'::jsonb) INTO prefs
  FROM public.profiles WHERE user_id = NEW.profile_user_id;
  
  IF (prefs->>'messages')::boolean IS DISTINCT FROM false THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.profile_user_id,
      'message',
      'New message from ' || NEW.sender_name,
      LEFT(NEW.message, 100),
      jsonb_build_object('message_id', NEW.id, 'sender_name', NEW.sender_name)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Update order notification trigger to check preferences
CREATE OR REPLACE FUNCTION public.notify_on_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  prefs jsonb;
BEGIN
  SELECT COALESCE(notification_prefs, '{"orders": true}'::jsonb) INTO prefs
  FROM public.profiles WHERE user_id = NEW.profile_user_id;
  
  IF (prefs->>'orders')::boolean IS DISTINCT FROM false THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.profile_user_id,
      'order',
      'New order from ' || NEW.customer_name,
      'Order #' || LEFT(NEW.id::text, 8),
      jsonb_build_object('order_id', NEW.id, 'customer_name', NEW.customer_name)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Update profile view notification trigger to check preferences
CREATE OR REPLACE FUNCTION public.notify_on_profile_view()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  view_count integer;
  prefs jsonb;
BEGIN
  SELECT COALESCE(notification_prefs, '{"views": true}'::jsonb) INTO prefs
  FROM public.profiles WHERE user_id = NEW.profile_user_id;
  
  IF (prefs->>'views')::boolean IS DISTINCT FROM false THEN
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
  END IF;
  RETURN NEW;
END;
$$;

