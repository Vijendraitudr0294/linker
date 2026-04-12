import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { supabaseMock } from "./local_client";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
const useSupabaseMock = import.meta.env.VITE_USE_SUPABASE_MOCK === "true";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabasePublishableKey && 
  supabaseUrl !== "undefined" && 
  supabasePublishableKey !== "undefined"
);
export const isUsingSupabaseMock = useSupabaseMock || !isSupabaseConfigured;

// SECURITY: Prevent mock client from ever reaching production
if (import.meta.env.PROD && isUsingSupabaseMock) {
  console.error(
    "🚨 FATAL: Mock Supabase client cannot be used in production. " +
    "Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY environment variables."
  );
}

const realClient = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Use SupabaseClient type to preserve some type safety across the codebase
if (!import.meta.env.PROD) {
  console.log(
    isUsingSupabaseMock 
      ? "🍦 Supabase: Using LOCAL MOCK client (Offline Mode)" 
      : "⚡ Supabase: Using REAL cloud client"
  );
}

export const supabase = (isUsingSupabaseMock ? supabaseMock : realClient) as unknown as SupabaseClient<Database>;
