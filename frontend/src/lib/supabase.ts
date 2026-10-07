import { createClient } from '@supabase/supabase-js';

const fallbackUrl = 'https://ezbselibyrmernjmhrnb.supabase.co';
const fallbackAnonKey = 'sb_publishable_WTYbDTzRoSQ87gbS_ZVtEQ_16LYMQB7';
const configuredUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const configuredAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)?.trim();
const hasPlaceholder = (value: string) => /your[_ -].*here|placeholder|your-project/i.test(value);
const configuredSupabase =
  configuredUrl &&
  configuredAnonKey &&
  !hasPlaceholder(configuredUrl) &&
  !hasPlaceholder(configuredAnonKey)
    ? { url: configuredUrl, anonKey: configuredAnonKey }
    : null;

export const isSupabaseConfigured = configuredSupabase !== null;
export const supabase = createClient(
  configuredSupabase?.url ?? fallbackUrl,
  configuredSupabase?.anonKey ?? fallbackAnonKey
);
