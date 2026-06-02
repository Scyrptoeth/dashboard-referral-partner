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

  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes: /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Security Check: Verifikasi status dan role dari database secara real-time
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single();

    // Jika profil tidak ditemukan atau dinonaktifkan
    if (!profile || profile.is_active === false) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'Akses ditangguhkan atau akun tidak ditemukan.');
      
      // Sangat penting: Kita harus benar-benar menghapus sesi agar /login tidak me-redirect balik ke /dashboard
      const res = NextResponse.redirect(loginUrl);
      res.cookies.set('sb-access-token', '', { maxAge: 0 });
      res.cookies.set('sb-refresh-token', '', { maxAge: 0 });
      return res;
    }

    const dbRole = profile.role;

    // Role-based authorization menggunakan data Database (Source of Truth)
    if (request.nextUrl.pathname.startsWith('/dashboard/developer') && dbRole !== 'developer') {
      return NextResponse.redirect(new URL('/dashboard/partner', request.url));
    }
    if (request.nextUrl.pathname.startsWith('/dashboard/partner') && dbRole === 'developer') {
      return NextResponse.redirect(new URL('/dashboard/developer', request.url));
    }
  }

  // Redirect from login if already logged in (hanya jika tidak ada error parameter)
  if (request.nextUrl.pathname === '/login' && session && !request.nextUrl.searchParams.has('error')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
