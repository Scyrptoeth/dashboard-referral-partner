import { formatCurrency, formatDate } from '@/lib/utils';
import DeveloperActions from '@/components/DeveloperActions';
import ReferralEditor from '@/components/ReferralEditor';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Referral | Persiapantubel',
};

export default async function DataReferralsPage() {
  const supabaseAdmin = createSupabaseAdminClient();

  const [referralsRes, partnersRes] = await Promise.all([
    supabaseAdmin
      .from('referrals')
      .select('*, profiles(full_name, whatsapp)')
      .order('created_at', { ascending: false }),
    supabaseAdmin.from('profiles').select('*').eq('role', 'partner')
  ]);

  const referrals = referralsRes.data || [];
  const partners = partnersRes.data || [];

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="heading-1 text-[#1C1C1A] mb-4">Data Referral</h1>
          <p className="text-[#738276]">Seluruh riwayat pendaftaran siswa melalui kode referral partner.</p>
        </div>
      </header>

      <section className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F5F5F2] border-b border-[#E8E8E4]">
              <tr>
                <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest">Pendaftar</th>
                <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest">Partner</th>
                <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest">Tanggal</th>
                <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest">Status</th>
                <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest text-right">Komisi</th>
                <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E4]">
              {referrals.map((ref) => {
                const partner = Array.isArray(ref.profiles) ? ref.profiles[0] : ref.profiles;
                return (
                  <tr key={ref.id} className="hover:bg-[#FDFDFB] transition-colors text-sm">
                    <td className="py-5 px-6 font-medium text-[#1C1C1A]">{ref.pendaftar_name}</td>
                    <td className="py-5 px-6">
                      <p className="text-[#1C1C1A]">{partner?.full_name}</p>
                      <p className="text-[10px] text-[#738276]">{partner?.whatsapp}</p>
                    </td>
                    <td className="py-5 px-6 text-[#738276]">{formatDate(ref.created_at)}</td>
                    <td className="py-5 px-6">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        ref.status === 'settled' ? 'bg-[#738276]/10 text-[#738276]' : 'bg-[#1C1C1A]/10 text-[#1C1C1A]'
                      }`}>
                        {ref.status === 'settled' ? 'Lunas' : 'Konfirmasi'}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right font-medium text-[#1C1C1A]">{formatCurrency(ref.amount)}</td>
                    <td className="py-5 px-6 text-right">
                      <ReferralEditor referral={ref} partners={partners} />
                    </td>
                  </tr>
                );
              })}
              {referrals.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-[#738276] italic">Belum ada data referral.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pt-12 border-t border-[#E8E8E4]">
        <h2 className="heading-2 text-[#1C1C1A] mb-8">Input Referral Baru</h2>
        <div className="max-w-md">
          <DeveloperActions partners={partners} /> {/* Only referral part will be used */}
        </div>
      </section>
    </div>
  );
}
