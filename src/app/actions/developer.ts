'use server'

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSupabaseAdminClient, getCurrentUserAndProfile } from '@/lib/supabase-server';

const phoneRegex = /^(08|628)[0-9]{8,13}$/;

const referralSchema = z.object({
  partner_id: z.string().uuid('ID Mitra tidak valid'),
  pendaftar_name: z.string().min(3, 'Nama pendaftar minimal 3 karakter').trim(),
  amount: z.coerce.number().min(1, 'Nominal komisi harus lebih dari 0'),
});

const partnerSchema = z.object({
  whatsapp: z.string().regex(phoneRegex, 'Format nomor WhatsApp tidak valid (Gunakan 08xxx atau 628xxx)'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  full_name: z.string().min(3, 'Nama lengkap minimal 3 karakter').trim(),
});

export async function addReferral(formData: FormData) {
  const rawData = {
    partner_id: formData.get('partner_id'),
    pendaftar_name: formData.get('pendaftar_name'),
    amount: formData.get('amount'),
  };

  const validated = referralSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { profile } = await getCurrentUserAndProfile();
  if (profile?.role !== 'developer') {
    return { error: 'Otorisasi ditolak.' };
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { error } = await supabaseAdmin.from('referrals').insert({
    ...validated.data,
    status: 'confirmed'
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/developer');
  return { success: true };
}

export async function registerPartner(formData: FormData) {
  const rawData = {
    whatsapp: formData.get('whatsapp'),
    password: formData.get('password'),
    full_name: formData.get('full_name'),
  };

  const validated = partnerSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: 'SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di environment variables. Hubungi admin.' };
  }

  const { profile } = await getCurrentUserAndProfile();
  if (profile?.role !== 'developer') {
    return { error: 'Otorisasi ditolak.' };
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const email = `${validated.data.whatsapp}@persiapantubel.com`;

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: validated.data.password,
    email_confirm: true,
    user_metadata: { role: 'partner' }
  });

  if (authError) {
    return { error: authError.message };
  }

  // Insert into profiles
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: authData.user.id,
    whatsapp: validated.data.whatsapp,
    full_name: validated.data.full_name,
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

export async function adminUpdatePartner(partnerId: string, updates: { password?: string; is_active?: boolean }) {
  // Check if caller is developer
  const { profile } = await getCurrentUserAndProfile();
  
  if (profile?.role !== 'developer') {
    return { error: 'Otorisasi ditolak.' };
  }

  const supabaseAdmin = createSupabaseAdminClient();

  // 1. Update Auth if password provided
  if (updates.password) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(partnerId, {
      password: updates.password
    });
    if (authError) return { error: authError.message };
  }

  // 2. Update Profile (is_active)
  if (updates.is_active !== undefined) {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ is_active: updates.is_active })
      .eq('id', partnerId);
    
    if (profileError) return { error: profileError.message };
  }

  revalidatePath('/dashboard/developer/partners');
  return { success: true };
}
