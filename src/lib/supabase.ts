import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jrbxskhyptdvurbxydxq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyYnhza2h5cHRkdnVyYnh5ZHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwMzA5MDAsImV4cCI6MjA0NjYwNjkwMH0.jl8g7ShZ96mi0Km_gMIbmngwlCX-KQG1d52kpKnlOLs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});