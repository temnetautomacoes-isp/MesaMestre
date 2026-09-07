/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjtstjvwspvsrqpampsn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqdHN0anZ3c3B2c3JxcGFtcHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3OTgzMTUsImV4cCI6MjEwNDM3NDMxNX0.9JV_lU1TVC8SWmo6LhNeBWrtOpjp4f3ZRVgFXmxlPXs';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase-url'));

export const supabase = createClient(supabaseUrl, supabaseAnonKey);



