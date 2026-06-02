import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { formatCurrency, formatDate } from '@/lib/utils';
import SettlementManager from '@/components/SettlementManager';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pencairan Dana | Persiapantubel',
};

export default async function PayoutsPage() {
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
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session?.user.id)
    .single();

  const isDeveloper = profile?.role === 'developer';

  if (isDeveloper) {
    const { data: settlementDataRes } = await supabase.from('profiles').select(`
      id, 
      full_name, 
      whatsapp, 
      referrals(id, pendaftar_name, amount, created_at, status)
    `).eq('role', 'partner');

    const settlementData = (settlementDataRes || []).map(p => {
      type DBReferral = {
        id: string;
        pendaftar_name: string;
        amount: number;
        created_at: string;
        status: string;
      };
      
      const unpaidReferrals = (p.referrals as unknown as DBReferral[] || []).filter(r => r.status !== 'settled');
      const total_pending = unpaidReferrals.reduce((sum, r) => sum + Number(r.amount), 0);
      
      return {
        id: p.id,
        full_name: p.full_name,
        whatsapp: p.whatsapp,
        total_pending,
        referrals: unpaidReferrals
      };
    }).filter(p => p.total_pending > 0);

    return (
      <div className="space-y-12">
        <header>
          <h1 className="heading-1 text-[#1C1C1A] mb-4">Manajemen Pencairan</h1>
          <p className="text-[#738276]">Proses pembayaran komisi kepada mitra yang memiliki piutang aktif.</p>
        </header>
        <SettlementManager data={settlementData} />
      </div>
    );
  }

  // Partner View: Payment History
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('partner_id', session?.user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-12">
      <header>
        <h1 className="heading-1 text-[#1C1C1A] mb-4">Riwayat Pencairan</h1>
        <p className="text-[#738276]">Daftar pembayaran komisi yang telah Kamu terima.</p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-[#E8E8E4]">
            <tr>
              <th className="pb-4 text-xs font-medium text-[#738276] uppercase tracking-widest">ID Transaksi</th>
              <th className="pb-4 text-xs font-medium text-[#738276] uppercase tracking-widest">Tanggal</th>
              <th className="pb-4 text-xs font-medium text-[#738276] uppercase tracking-widest">Status</th>
              <th className="pb-4 text-xs font-medium text-[#738276] uppercase tracking-widest text-right">Nominal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8E4]/50">
            {(payments || []).map((pay) => (
              <tr key={pay.id} className="group hover:bg-[#F5F5F2] transition-colors">
                <td className="py-5 px-2 text-xs font-mono text-[#738276]">{pay.id.slice(0, 8)}...</td>
                <td className="py-5 px-2 text-sm text-[#1C1C1A]">{formatDate(pay.paid_at || pay.created_at)}</td>
                <td className="py-5 px-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[#4A7356]/10 text-[#4A7356]">
                    Lunas
                  </span>
                </td>
                <td className="py-5 px-2 text-right font-medium text-[#1C1C1A]">{formatCurrency(pay.amount)}</td>
              </tr>
            ))}
            {(!payments || payments.length === 0) && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-[#738276] italic">Belum ada riwayat pembayaran.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
