/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || 
  'https://wjtstjvwspvsrqpampsn.supabase.co';

const supabaseAnonKey = 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  'sb_publishable_HMowkEv1_x9E0yOgzBdUNg_Vh9QKvA8';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase-url'));

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

