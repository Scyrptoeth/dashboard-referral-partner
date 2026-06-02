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

  const role = session?.user?.user_metadata?.role;

  // Protected routes: /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Security Check: Verifikasi status is_active dari database secara real-time
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single();

    // Jika profil tidak ditemukan atau dinonaktifkan
    if (!profile || profile.is_active === false) {
      // Kita tidak bisa memanggil auth.signOut() langsung di middleware Next.js secara efektif untuk session cookies,
      // tapi kita bisa menghapus cookie atau me-redirect dengan instruksi menghapus sesi.
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'Akses ditangguhkan. Hubungi admin.');
      
      const res = NextResponse.redirect(loginUrl);
      // Bersihkan session cookies
      res.cookies.delete('sb-access-token');
      res.cookies.delete('sb-refresh-token');
      return res;
    }

    // Role-based authorization
    if (request.nextUrl.pathname.startsWith('/dashboard/developer') && role !== 'developer') {
      return NextResponse.redirect(new URL('/dashboard/partner', request.url));
    }
    if (request.nextUrl.pathname.startsWith('/dashboard/partner') && role === 'developer') {
      return NextResponse.redirect(new URL('/dashboard/developer', request.url));
    }
  }

  // Redirect from login if already logged in
  if (request.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
