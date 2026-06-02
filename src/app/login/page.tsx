'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

function LoginContent() {
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil error dari URL (dikirim oleh middleware)
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(urlError);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const email = `${whatsapp}@persiapantubel.com`;
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Informasi login tidak sesuai. Silakan periksa kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="mb-12 text-center">
          <h1 className="heading-2 text-[#1C1C1A] mb-3">Selamat datang.</h1>
          <p className="text-[#738276] text-sm">Masuk ke portal kemitraan Kamu.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#4A4A48] uppercase tracking-wide">
              Nomor WhatsApp
            </label>
            <input
              type="text"
              placeholder="Contoh: 08123456789"
              className="h-input"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-medium text-[#4A4A48] uppercase tracking-wide">
                Kata Sandi
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan kata sandi"
                className="h-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#738276] hover:text-[#1C1C1A] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-[#B94A48]/5 border border-[#B94A48]/10 rounded-xl">
              <p className="text-[#B94A48] text-sm text-center font-medium">
                {error}
              </p>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="h-btn w-full"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Masuk ke Dashboard'}
            </button>
          </div>
        </form>

        <p className="mt-12 text-center text-xs text-[#738276]">
          Mengalami kendala? Silakan hubungi admin Persiapantubel.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#738276]" size={32} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
