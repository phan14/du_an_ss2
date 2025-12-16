
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Read from Vite env (Vite exposes env vars prefixed with VITE_ via import.meta.env)
// See: https://vitejs.dev/guide/env-and-mode.html
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? '';
const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '';

// Helpful developer message with examples for .env.local
if (!supabaseUrl || !supabaseKey) {
  const msg = [
    'Supabase not configured.',
    'Create a .env.local file with the following (example):',
    'VITE_SUPABASE_URL=https://kbtyxjzhcxcmbvxxypzy.supabase.co',
    "VITE_SUPABASE_ANON_KEY=sb_secret_ZDLWayJY3KaZS-wfFeLNNQ_yZgHUCdG",
    'Then restart the dev server so Vite picks up the new env vars.'
  ].join('\n');
  // Log for developers
  console.error(msg);
  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    // Only show a browser alert when running in the browser
    window.alert(msg);
  }
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
