import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PREFIXES = ['/login', '/signup', '/auth'];

// Refreshes the Supabase session cookie on every request and enforces:
// signed in → onboarded → (admin for /admin). The database (RLS) is the real gate; this is the UX layer.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { pathname } = request.nextUrl;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirect = (to: string) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    url.search = '';
    const r = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  };

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (user && (pathname === '/login' || pathname === '/signup')) return redirect('/');
    return response;
  }

  if (!user) return redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarded_at, role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';
  // Admins (Mohamed, Anas) don't need the student intake form.
  if (isAdmin && !profile?.onboarded_at && (pathname === '/' || pathname === '/onboarding')) return redirect('/admin');
  if (!isAdmin && !profile?.onboarded_at && pathname !== '/onboarding') return redirect('/onboarding');
  if (profile?.onboarded_at && pathname === '/onboarding') return redirect('/');
  if (pathname.startsWith('/admin') && !isAdmin) return redirect('/');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
