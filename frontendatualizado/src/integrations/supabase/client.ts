import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qyaorhetkrgmkrtzjpvm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YW9yaGV0a3JnbWtydHpqcHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NzQ5NDEsImV4cCI6MjA2NjM1MDk0MX0.vhWjLl9P5vh-LuVBV9aoQPor2vxJFR0ysUrp6SEjRSM';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});
