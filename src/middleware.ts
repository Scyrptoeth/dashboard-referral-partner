import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

function redirectToLogin(request: NextRequest, message?: string, clearAuthCookies = false) {
  const loginUrl = new URL('/login', request.url);
  if (message) {
    loginUrl.searchParams.set('error', message);
  }

  const redirectResponse = NextResponse.redirect(loginUrl);

  if (clearAuthCookies) {
    request.cookies
      .getAll()
      .filter((cookie) => cookie.name.startsWith('sb-'))
      .forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, '', {
          path: '/',
          maxAge: 0,
        });
      });
  }

  return redirectResponse;
}

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
  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes: /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return redirectToLogin(request);
    }

    // 2. Verifikasi profil dari database dengan rujukan ID yang valid
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    // Jika terjadi error teknis atau profil tidak ditemukan
    if (profileError || !profile) {
      console.error('Middleware Profile Error:', profileError?.message);
      return redirectToLogin(
        request,
        'Profil Kamu tidak ditemukan atau terjadi gangguan koneksi. Silakan masuk kembali.',
        true
      );
    }

    // Jika akun dinonaktifkan
    if (profile.is_active === false) {
      return redirectToLogin(request, 'Akses akun Kamu ditangguhkan.', true);
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
