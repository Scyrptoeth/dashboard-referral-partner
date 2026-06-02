'use server'

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient, getCurrentUserAndProfile } from '@/lib/supabase-server';

/**
 * Fitur Manajemen Pencairan (Atomic RPC Transaction)
 */
export async function settlePartnerPayments(partnerId: string, referralIds: string[], totalAmount: number) {
  const { profile } = await getCurrentUserAndProfile();
  if (profile?.role !== 'developer') {
    return { error: 'Otorisasi ditolak.' };
  }

  const supabaseAdmin = createSupabaseAdminClient();

  // Menggunakan RPC untuk transaksi atomik di level database
  const { data: paymentId, error } = await supabaseAdmin.rpc('settle_partner_payments', {
    p_partner_id: partnerId,
    p_referral_ids: referralIds,
    p_total_amount: totalAmount
  });

  if (error) return { error: error.message };
  
  revalidatePath('/dashboard/developer');
  revalidatePath('/dashboard/partner');
  revalidatePath('/dashboard/payouts');
  
  return { success: true, paymentId };
}

/**
 * Fitur Manajemen Konfigurasi Reward
 */
export async function updateRewardConfigs(configs: { rank: number, percentage: number }[]) {
  const { profile } = await getCurrentUserAndProfile();
  if (profile?.role !== 'developer') {
    return { error: 'Otorisasi ditolak.' };
  }

  const supabaseAdmin = createSupabaseAdminClient();

  // Update secara batch (loop karena Supabase upsert butuh matching key)
  const results = await Promise.all(configs.map(config => 
    supabaseAdmin.from('reward_configs').update({ percentage: config.percentage }).eq('rank', config.rank)
  ));

  const error = results.find(r => r.error)?.error;
  if (error) return { error: error.message };

  revalidatePath('/dashboard/developer');
  return { success: true };
}

/**
 * Fitur Feedback Anonim
 */
export async function submitFeedback(content: string) {
  if (!content || content.trim().length < 10) {
    return { error: 'Feedback terlalu pendek (minimal 10 karakter).' };
  }

  const { user } = await getCurrentUserAndProfile();
  if (!user) {
    return { error: 'Kamu harus masuk untuk mengirim feedback.' };
  }

  const supabaseAdmin = createSupabaseAdminClient();

  // Insert anonim (RLS sudah diset untuk insert authenticated namun tanpa relasi kolom partner_id)
  const { error } = await supabaseAdmin.from('feedback').insert({
    content: content.trim()
  });

  if (error) return { error: error.message };

  return { success: true };
}

export async function deleteFeedback(id: string) {
  const { profile } = await getCurrentUserAndProfile();
  if (profile?.role !== 'developer') {
    return { error: 'Otorisasi ditolak.' };
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { error } = await supabaseAdmin.from('feedback').delete().eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/developer/feedback');
  return { success: true };
}

export async function markFeedbackAsRead(id: string) {
  const { profile } = await getCurrentUserAndProfile();
  if (profile?.role !== 'developer') {
    return { error: 'Otorisasi ditolak.' };
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { error } = await supabaseAdmin.from('feedback').update({ is_read: true }).eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/developer/feedback');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateReferral(referralId: string, updates: { pendaftar_name?: string; amount?: number; partner_id?: string }) {
  const { profile } = await getCurrentUserAndProfile();
  if (profile?.role !== 'developer') {
    return { error: 'Otorisasi ditolak.' };
  }

  const supabaseAdmin = createSupabaseAdminClient();

  // Check if referral is already settled
  const { data: referral } = await supabaseAdmin.from('referrals').select('status').eq('id', referralId).single();
  if (referral?.status === 'settled') {
    return { error: 'Data yang sudah lunas tidak dapat diubah.' };
  }

  const { error } = await supabaseAdmin
    .from('referrals')
    .update(updates)
    .eq('id', referralId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/developer/referrals');
  revalidatePath('/dashboard/developer');
  revalidatePath('/dashboard/partner');
  return { success: true };
}
