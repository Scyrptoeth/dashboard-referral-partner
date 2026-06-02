import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // 1. Validasi user secara server-side (lebih aman dari getSession)
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // Protected routes: /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Verifikasi profil dari database dengan rujukan ID yang valid
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    // Jika terjadi error teknis atau profil tidak ditemukan
    if (profileError || !profile) {
      console.error('Middleware Profile Error:', profileError?.message);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'Profil Kamu tidak ditemukan atau terjadi gangguan koneksi.');
      return NextResponse.redirect(loginUrl);
    }

    // Jika akun dinonaktifkan
    if (profile.is_active === false) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'Akses akun Kamu ditangguhkan.');
      return NextResponse.redirect(loginUrl);
    }

    const dbRole = profile.role;

    // 3. Role-based authorization
    if (request.nextUrl.pathname.startsWith('/dashboard/developer') && dbRole !== 'developer') {
      return NextResponse.redirect(new URL('/dashboard/partner', request.url));
    }
    if (request.nextUrl.pathname.startsWith('/dashboard/partner') && dbRole === 'developer') {
      return NextResponse.redirect(new URL('/dashboard/developer', request.url));
    }
  }

  // Redirect from login if already logged in (hanya jika tidak ada error)
  if (request.nextUrl.pathname === '/login' && user && !request.nextUrl.searchParams.has('error')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
