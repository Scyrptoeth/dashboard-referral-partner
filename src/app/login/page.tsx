'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Loader2, Phone, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const email = `${whatsapp}@persiapantubel.com`;
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError('Kredensial tidak valid. Periksa nomor WA dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd] px-4">
      {/* Decorative Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="max-w-md w-full relative z-10">
        <div className="mb-8 flex flex-col items-center">
          <div className="b-badge mb-4 bg-blue-600 text-white border-none px-3 py-1">v1.0-STABLE</div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            LOGIN_SYSTEM
          </h1>
          <p className="font-mono text-xs text-slate-400 mt-2">DASHBOARD_REFERRAL_PARTNER_V2</p>
        </div>

        <div className="b-card p-8 sm:p-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block font-mono text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">
                User_ID (WhatsApp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Phone size={16} />
                </span>
                <input
                  type="text"
                  placeholder="08123456789"
                  className="b-input pl-10"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">
                Security_Key (Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="b-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-600 text-red-600 font-mono text-xs font-bold">
                [ERROR]: {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="b-btn w-full group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Masuk Ke Dashboard
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 flex justify-between items-center font-mono text-[10px] text-slate-400 uppercase tracking-tighter">
          <span>&copy; 2026 PERSIAPANTUBEL_INC</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            System_Online
          </span>
        </div>
      </div>
    </div>
  );
}
