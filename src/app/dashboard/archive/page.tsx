import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Archive as ArchiveIcon, History } from 'lucide-react';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Arsip Rujukan | Persiapantubel',
};

export default async function ArchivePage() {
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

  const { data: { session } } = await supabase.auth.getSession();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session?.user.id).single();
  const isDeveloper = profile?.role === 'developer';

  let query = supabase
    .from('referrals')
    .select('*, profiles(full_name, whatsapp), payments(amount, paid_at)')
    .eq('status', 'settled')
    .order('created_at', { ascending: false });

  if (!isDeveloper) {
    query = query.eq('partner_id', session?.user.id);
  }

  const { data: settledReferrals } = await query;

  return (
    <div className="space-y-16 pb-24">
      <header className="max-w-2xl">
        <h1 className="heading-1 text-[#1C1C1A] mb-6">Arsip Rujukan</h1>
        <p className="text-lg text-[#738276] leading-relaxed">
          Histori seluruh rujukan yang telah berhasil dicairkan dan berstatus lunas.
        </p>
      </header>

      <section className="border-t border-[#E8E8E4] pt-16">
        <div className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F5F5F2] border-b border-[#E8E8E4]">
                <tr>
                  <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest">Pendaftar</th>
                  {isDeveloper && <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest">Mitra</th>}
                  <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest">Tgl Rujukan</th>
                  <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest">Tgl Lunas</th>
                  <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest text-right">Komisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E4]">
                {settledReferrals?.map((ref) => {
                  const partner = Array.isArray(ref.profiles) ? ref.profiles[0] : ref.profiles;
                  const payment = Array.isArray(ref.payments) ? ref.payments[0] : ref.payments;
                  return (
                    <tr key={ref.id} className="hover:bg-[#FDFDFB] transition-colors text-sm">
                      <td className="py-5 px-6 font-medium text-[#1C1C1A]">{ref.pendaftar_name}</td>
                      {isDeveloper && (
                        <td className="py-5 px-6">
                          <p className="text-[#1C1C1A]">{partner?.full_name}</p>
                          <p className="text-[10px] text-[#738276]">{partner?.whatsapp}</p>
                        </td>
                      )}
                      <td className="py-5 px-6 text-[#738276]">{formatDate(ref.created_at)}</td>
                      <td className="py-5 px-6 text-[#738276]">{payment?.paid_at ? formatDate(payment.paid_at) : '-'}</td>
                      <td className="py-5 px-6 text-right font-medium text-[#1C1C1A]">{formatCurrency(ref.amount)}</td>
                    </tr>
                  );
                })}
                {(!settledReferrals || settledReferrals.length === 0) && (
                  <tr>
                    <td colSpan={isDeveloper ? 5 : 4} className="py-12 text-center text-sm text-[#738276] italic">Belum ada rujukan yang lunas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
