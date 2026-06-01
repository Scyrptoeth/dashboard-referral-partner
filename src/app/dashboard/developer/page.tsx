import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Terminal, Users, TrendingUp, DollarSign, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function DeveloperDashboard() {
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

  // Parallel stats fetching
  const [partnerRes, referralsRes, pendingRes] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'partner'),
    supabase.from('referrals').select('amount'),
    supabase.from('payments').select('amount').eq('status', 'pending')
  ]);

  const partnerCount = partnerRes.count || 0;
  const totalReferrals = referralsRes.data?.length || 0;
  const totalCommission = referralsRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const totalPending = pendingRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">System_Status: Operational</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            DEV_OVERVIEW
          </h1>
          <p className="font-mono text-xs text-slate-500 mt-4 max-w-md uppercase tracking-tight">
            Monitoring real-time performance metrics and partner ecosystem activities.
          </p>
        </div>
        <div className="font-mono text-[10px] text-slate-300 text-right hidden md:block uppercase">
          Build: 2026.06.01_v1.0<br />
          Ref: apnilwlirfjqmkjepkzc
        </div>
      </header>

      {/* Stats Grid - Technical Brutalist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-2 border-slate-900 bg-slate-900 overflow-hidden shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        {[
          { label: 'Total_Partners', value: partnerCount, icon: Users, color: 'text-blue-500' },
          { label: 'Referral_Count', value: totalReferrals, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Accumulated_Commission', value: formatCurrency(totalCommission), icon: DollarSign, color: 'text-amber-500' },
          { label: 'Pending_Payouts', value: formatCurrency(totalPending), icon: Clock, color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 border-[0.5px] border-slate-900 group">
            <div className="flex items-center justify-between mb-8">
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight font-mono">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Quick Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <Terminal size={20} className="text-slate-900" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">System_Commands</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'Add_Referral_Manual', action: 'Execute_Input', icon: ArrowRight },
              { label: 'Register_New_Partner', action: 'Create_User', icon: ArrowRight },
              { label: 'Reset_Leaderboard', action: 'Archive_Period', icon: ArrowRight, danger: true },
            ].map((cmd, i) => (
              <button 
                key={i}
                className={`w-full flex items-center justify-between p-5 border-2 transition-all group ${
                  cmd.danger 
                  ? 'border-red-600 bg-red-50 hover:bg-red-600 hover:text-white' 
                  : 'border-slate-900 bg-white hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="text-left">
                  <p className="font-mono text-[10px] font-bold uppercase opacity-50 tracking-widest">{cmd.label}</p>
                  <p className="font-black uppercase tracking-tight">{cmd.action}</p>
                </div>
                <cmd.icon size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* Feedback / Logs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <MessageSquare size={20} className="text-slate-900" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Incoming_Logs</h2>
          </div>
          
          <div className="b-card bg-slate-50 border-dashed min-h-[300px] flex flex-col items-center justify-center text-center p-12">
            <Terminal size={48} className="text-slate-200 mb-6" />
            <p className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">
              [SYSTEM_MESSAGE]: No recent activity logs found in the feedback buffer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
