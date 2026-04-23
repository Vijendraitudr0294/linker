-- Biotra V2 Core Modules: Products, Courses, and AutoDM

-- 1. Courses & Lessons
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT, -- Markdown or JSON
    video_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. AutoDM Configurations
CREATE TABLE IF NOT EXISTS dm_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trigger_type TEXT DEFAULT 'comment', -- 'comment', 'dm', 'keyword'
    trigger_keyword TEXT,
    reply_message TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Lead Magnets (already handled by forms, but we can add a specific lead_magnets view/table if needed)

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_flows ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own courses" ON courses
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own lessons" ON lessons
    FOR ALL USING (EXISTS (
        SELECT 1 FROM courses WHERE courses.id = lessons.course_id AND courses.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their own DM flows" ON dm_flows
    FOR ALL USING (auth.uid() = user_id);

-- Public view policies for published courses
CREATE POLICY "Anyone can view published courses" ON courses
    FOR SELECT USING (published = true);

CREATE POLICY "Anyone can view lessons of published courses" ON lessons
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM courses WHERE courses.id = lessons.course_id AND courses.published = true
    ));
