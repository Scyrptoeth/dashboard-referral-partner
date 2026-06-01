import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Users, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function DeveloperDashboard() {
  const cookieStore = cookies();
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

  // Stats fetching
  const { count: partnerCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'partner');

  const { data: referrals } = await supabase
    .from('referrals')
    .select('amount');
  
  const totalReferrals = referrals?.length || 0;
  const totalCommission = referrals?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  const { data: pendingPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'pending');
  
  const totalPending = pendingPayments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Developer Overview</h1>
        <p className="text-slate-500">Pantau performa partner dan status keuangan sistem.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Total Partner</p>
          <p className="text-2xl font-bold text-slate-900">{partnerCount}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Total Referral</p>
          <p className="text-2xl font-bold text-slate-900">{totalReferrals}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Total Komisi</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalCommission)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Pending Payout</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalPending)}</p>
        </div>
      </div>

      {/* Action Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Aksi Cepat</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 font-medium text-slate-700 flex justify-between items-center">
              Tambah Data Referral Manual
              <span className="text-blue-600 text-sm">Input +</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 font-medium text-slate-700 flex justify-between items-center">
              Daftarkan Partner Baru
              <span className="text-blue-600 text-sm">User +</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-100 font-medium text-red-700 flex justify-between items-center">
              Reset Leaderboard (Tutup Periode)
              <span className="text-red-600 text-sm text-xs font-bold px-2 py-1 bg-white rounded border border-red-200 italic">Bahaya!</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Feedback Terbaru</h2>
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="text-sm">Belum ada feedback anonim.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
