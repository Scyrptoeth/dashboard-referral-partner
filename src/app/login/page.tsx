'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

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
      setError('AUTH_FAILED: CHECK_CREDENTIALS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col md:flex-row overflow-hidden">
      {/* Left: Giant Typography Side */}
      <div className="hidden md:flex flex-1 relative bg-[#1A1A1A] text-[#F5F5F0] items-center justify-center p-20 overflow-hidden">
        <div className="giant-text opacity-10 absolute -left-10 top-0 select-none">LOGIN</div>
        <div className="giant-text opacity-10 absolute -right-20 bottom-0 select-none">ACCESS</div>
        
        <div className="relative z-10 space-y-4">
          <h2 className="text-8xl font-black leading-none tracking-tighter uppercase italic">
            Partner<br/>Portal
          </h2>
          <p className="font-sans text-lg font-light tracking-[0.2em] uppercase opacity-50">
            // persiapantubel.bespoke
          </p>
        </div>
      </div>

      {/* Right: Minimalist Form Side */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-24 relative">
        <div className="absolute top-10 right-10 flex items-center gap-4">
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest opacity-30">EN / ID</span>
          <div className="w-10 h-[1px] bg-black opacity-20"></div>
          <span className="font-display text-sm font-black italic">PT.V2</span>
        </div>

        <div className="max-w-sm w-full mx-auto space-y-12">
          <header>
            <h1 className="text-4xl font-black text-black leading-tight uppercase tracking-tighter">
              Verify<br/>Identity
            </h1>
          </header>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2 group">
              <label className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4A373]">
                01. WHATSAPP_ID
              </label>
              <input
                type="text"
                placeholder="08123456789"
                className="w-full py-4 bg-transparent border-b-2 border-black/10 focus:border-black outline-none transition-all font-display text-2xl font-black"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 group">
              <label className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4A373]">
                02. PASS_KEY
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full py-4 bg-transparent border-b-2 border-black/10 focus:border-black outline-none transition-all font-display text-2xl font-black"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-black/20 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="font-sans text-[10px] font-bold text-red-600 bg-red-50 p-2 uppercase tracking-widest">
                [!] {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="ed-btn w-full justify-between"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Request_Access</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <footer className="pt-10 border-t border-black/5">
            <p className="font-sans text-[9px] text-black/30 leading-relaxed uppercase tracking-widest">
              Secured access for authorized partners only. By entering, you agree to the transparency protocols of Persiapantubel Inc.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
