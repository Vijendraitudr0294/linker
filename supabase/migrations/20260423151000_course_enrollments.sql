-- Create course_enrollments table to track sales and access
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    creator_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- The creator who owns the course
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    amount_paid NUMERIC DEFAULT 0,
    payment_id TEXT,
    status TEXT DEFAULT 'completed', -- 'completed', 'pending', 'refunded'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Creators can view their own course enrollments"
    ON public.course_enrollments
    FOR SELECT
    USING (auth.uid() = creator_user_id);

CREATE POLICY "Allow public enrollment insertion"
    ON public.course_enrollments
    FOR INSERT
    WITH CHECK (true); -- Usually handled by service role or specific logic, but for simplicity here
