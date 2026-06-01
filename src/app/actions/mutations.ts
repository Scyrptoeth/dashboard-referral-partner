'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

/**
 * Fitur Manajemen Pencairan (Model Hybrid Detail)
 */
export async function settlePartnerPayments(partnerId: string, referralIds: string[], totalAmount: number) {
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

  // 1. Catat di tabel payments sebagai riwayat pencairan
  const { data: payment, error: paymentError } = await supabase.from('payments').insert({
    partner_id: partnerId,
    amount: totalAmount,
    status: 'paid',
    paid_at: new Date().toISOString()
  }).select().single();

  if (paymentError) return { error: paymentError.message };

  // 2. Hubungkan rujukan yang dicairkan dengan ID pembayaran dan set status 'settled'
  const { error: referralError } = await supabase
    .from('referrals')
    .update({ 
      status: 'settled',
      payment_id: payment.id 
    })
    .in('id', referralIds);

  if (referralError) {
    console.error('Failed to update referrals:', referralError);
    // Optional: Kita bisa rollback payment di sini jika kritikal
  }
  
  revalidatePath('/dashboard/developer');
  revalidatePath('/dashboard/partner');
  return { success: true, paymentId: payment.id };
}

/**
 * Fitur Manajemen Konfigurasi Reward
 */
export async function updateRewardConfigs(configs: { rank: number, percentage: number }[]) {
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

  // Update secara batch (loop karena Supabase upsert butuh matching key)
  const results = await Promise.all(configs.map(config => 
    supabase.from('reward_configs').update({ percentage: config.percentage }).eq('rank', config.rank)
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

  // Insert anonim (RLS sudah diset untuk insert authenticated namun tanpa relasi kolom partner_id)
  const { error } = await supabase.from('feedback').insert({
    content: content.trim()
  });

  if (error) return { error: error.message };

  return { success: true };
}
