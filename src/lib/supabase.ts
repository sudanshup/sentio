import { createClient } from '@supabase/supabase-js';

// Access environment variables (Vite-specific)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single supabase client for interacting with your database
// We only create it if the keys are present to avoid runtime crashes
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Helper to check if Supabase is ready
export const isSupabaseConfigured = () => !!supabase;
