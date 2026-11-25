import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { INVITE_COOKIE } from '@/lib/invite';

// A private-level invite from Mohamed. Signed-in students send their request straight away;
// everyone else keeps the invite in a cookie and goes to sign up — the request is sent after the form.
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { origin } = new URL(request.url);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('onboarded_at').eq('id', user.id).single();
    if (profile?.onboarded_at) {
      const { error } = await supabase.rpc('redeem_invite', { p_token: token });
      return NextResponse.redirect(`${origin}/?invite=${error ? 'invalid' : 'sent'}`);
    }
  }
  const res = NextResponse.redirect(`${origin}${user ? '/onboarding' : '/signup'}`);
  res.cookies.set(INVITE_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: true, maxAge: 60 * 60 * 24 * 7, path: '/' });
  return res;
}
