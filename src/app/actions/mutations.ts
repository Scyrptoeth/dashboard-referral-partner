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

  // 2. Karena skema awal kita tidak memiliki kolom payment_id di referrals, 
  // kita asumsikan status 'confirmed' pada referrals berarti 'berhak cair'.
  // Untuk sesi ini, kita tandai rujukan tersebut sebagai 'confirmed' atau 
  // idealnya kita butuh kolom status tambahan jika ingin menandai rujukan spesifik telah terbayar.
  // Sesuai skema saat ini, kita pastikan data pencairan tercatat.
  
  revalidatePath('/dashboard/developer');
  return { success: true, paymentId: payment.id };
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
