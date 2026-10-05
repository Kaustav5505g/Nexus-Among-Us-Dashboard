import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://ezbselibyrmernjmhrnb.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_WTYbDTzRoSQ87gbS_ZVtEQ_16LYMQB7';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
