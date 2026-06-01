'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function addReferral(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const partner_id = formData.get('partner_id') as string;
  const pendaftar_name = formData.get('pendaftar_name') as string;
  const amountStr = formData.get('amount') as string;
  
  if (!partner_id || !pendaftar_name || !amountStr) {
    return { error: 'Semua field harus diisi' };
  }

  const { error } = await supabase.from('referrals').insert({
    partner_id,
    pendaftar_name,
    amount: Number(amountStr),
    status: 'confirmed'
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/developer');
  return { success: true };
}

export async function registerPartner(formData: FormData) {
  const whatsapp = formData.get('whatsapp') as string;
  const password = formData.get('password') as string;
  const full_name = formData.get('full_name') as string;

  if (!whatsapp || !password || !full_name) {
    return { error: 'Semua field harus diisi' };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: 'SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di environment variables. Hubungi admin.' };
  }

  // Use service_role_key to create user to avoid signing out the developer
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  const email = `${whatsapp}@persiapantubel.com`;

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return { error: authError.message };
  }

  // Insert into profiles
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: authData.user.id,
    whatsapp,
    full_name,
    role: 'partner'
  });

  if (profileError) {
    // Attempt rollback user creation if profile insert fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return { error: profileError.message };
  }

  revalidatePath('/dashboard/developer');
  return { success: true };
}
