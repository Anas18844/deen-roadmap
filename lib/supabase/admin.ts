import 'server-only';
import { createClient } from '@supabase/supabase-js';

/** Service-role client. Server only; use only after checking the caller's permission. */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const BOOKS_BUCKET = 'books';
