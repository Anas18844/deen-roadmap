import 'server-only';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

export const INVITE_COOKIE = 'deen_invite';

/** If the visitor arrived through an invite link, send the request now (after onboarding) and clear it. */
export async function redeemPendingInvite(supabase: SupabaseClient): Promise<'sent' | 'invalid' | null> {
  const jar = await cookies();
  const token = jar.get(INVITE_COOKIE)?.value;
  if (!token) return null;
  const { error } = await supabase.rpc('redeem_invite', { p_token: token });
  try {
    jar.delete(INVITE_COOKIE);
  } catch {
    // read-only cookie context (server component) — the next action/route clears it
  }
  return error ? 'invalid' : 'sent';
}
