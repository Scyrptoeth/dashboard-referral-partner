'use client';

import { useState } from 'react';
import { updatePassword } from '@/app/actions/auth';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Password Kamu berhasil diperbarui.');
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-16 pb-24">
      <header className="max-w-2xl">
        <h1 className="heading-1 text-[#1C1C1A] mb-6">Pengaturan Akun</h1>
        <p className="text-lg text-[#738276] leading-relaxed">
          Kelola keamanan akun Kamu. Kami menyarankan untuk mengganti password secara berkala.
        </p>
      </header>

      <section className="max-w-xl border-t border-[#E8E8E4] pt-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-[#1C1C1A]/5 flex items-center justify-center text-[#1C1C1A]">
            <ShieldCheck size={20} />
          </div>
          <h2 className="heading-2 text-[#1C1C1A]">Ganti Password</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#738276] uppercase tracking-widest">Password Baru</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="h-input pr-12"
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#738276] hover:text-[#1C1C1A]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#738276] uppercase tracking-widest">Konfirmasi Password</label>
            <input
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              className="h-input"
              placeholder="Ulangi password baru"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-btn w-full bg-[#1C1C1A] text-white hover:bg-[#1C1C1A]/90 border-none mt-4"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} /> Memproses...
              </span>
            ) : "Perbarui Password"}
          </button>
        </form>
      </section>
    </div>
  );
}
