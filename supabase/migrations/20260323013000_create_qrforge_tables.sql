-- Create QR Codes Table
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'url', -- url, text, email, phone, sms, wifi, vcard, etc.
    mode TEXT NOT NULL DEFAULT 'static', -- static, dynamic
    content TEXT NOT NULL,
    short_code TEXT UNIQUE, -- for dynamic redirects (qrforge.app/r/abc)
    fg_color TEXT DEFAULT '#000000',
    bg_color TEXT DEFAULT '#ffffff',
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast user searches
CREATE INDEX IF NOT EXISTS qr_codes_user_id_idx ON public.qr_codes(user_id);
CREATE INDEX IF NOT EXISTS qr_codes_short_code_idx ON public.qr_codes(short_code);

-- Enable RLS
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Policies for qr_codes
CREATE POLICY "Users can view their own QR codes" 
    ON public.qr_codes FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own QR codes" 
    ON public.qr_codes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own QR codes" 
    ON public.qr_codes FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own QR codes" 
    ON public.qr_codes FOR DELETE 
    USING (auth.uid() = user_id);


-- Create Scans Table (for analytics)
CREATE TABLE IF NOT EXISTS public.qr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    country TEXT,
    city TEXT,
    region TEXT,
    device_type TEXT, -- Mobile, Tablet, Desktop
    os TEXT, -- iOS, Android, macOS, Windows
    browser TEXT, -- Chrome, Safari, Firefox
    referrer TEXT
);

-- Index for scan lookups by code
CREATE INDEX IF NOT EXISTS qr_scans_qr_code_id_idx ON public.qr_scans(qr_code_id);

-- Enable RLS
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- Policies for scans
CREATE POLICY "Users can view scans for their own QR codes" 
    ON public.qr_scans FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.qr_codes 
            WHERE qr_codes.id = qr_scans.qr_code_id 
            AND qr_codes.user_id = auth.uid()
        )
    );

-- Anyone can insert a scan (from edge redirects)
CREATE POLICY "Anyone can record a scan" 
    ON public.qr_scans FOR INSERT 
    WITH CHECK (true);

-- Functions and Triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_qr_codes_updated
    BEFORE UPDATE ON public.qr_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
