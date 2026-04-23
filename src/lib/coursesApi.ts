import { supabase } from "@/integrations/supabase/client";

export type Course = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  currency: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  order_index: number;
  created_at: string;
};

export const listMyCourses = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data as Course[];
};

export const createCourse = async (course: Partial<Course>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("courses")
    .insert({ ...course, user_id: user.id })
    .select("*")
    .single();
  
  if (error) throw error;
  return data as Course;
};

export const updateCourse = async (id: string, updates: Partial<Course>) => {
  const { data, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  
  if (error) throw error;
  return data as Course;
};

export const deleteCourse = async (id: string) => {
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw error;
};

export const listLessons = async (courseId: string) => {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });
  
  if (error) throw error;
  return data as Lesson[];
};

export const createLesson = async (lesson: Partial<Lesson>) => {
  const { data, error } = await supabase
    .from("lessons")
    .insert(lesson)
    .select("*")
    .single();
  
  if (error) throw error;
  return data as Lesson;
};

export const updateLesson = async (id: string, updates: Partial<Lesson>) => {
  const { data, error } = await supabase
    .from("lessons")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  
  if (error) throw error;
  return data as Lesson;
};

export const deleteLesson = async (id: string) => {
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) throw error;
};
