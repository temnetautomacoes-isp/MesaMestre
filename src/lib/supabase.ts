/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || 
  'https://wjtstjvwspvsrqpampsn.supabase.co';

const supabaseAnonKey = 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqdHN0anZ3c3B2c3JxcGFtcHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3OTgzMTUsImV4cCI6MjEwNDM3NDMxNX0.9JV_lU1TVC8SWmo6LhNeBWrtOpjp4f3ZRVgFXmxlPXs';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase-url'));

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


