
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_user_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact message
CREATE POLICY "Anyone can insert contact messages"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Profile owners can read their messages
CREATE POLICY "Users can read own messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_user_id);

-- Profile owners can update (mark as read)
CREATE POLICY "Users can update own messages"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_user_id);

-- Profile owners can delete
CREATE POLICY "Users can delete own messages"
  ON public.contact_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = profile_user_id);
