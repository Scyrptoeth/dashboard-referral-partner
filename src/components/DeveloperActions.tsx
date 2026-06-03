'use client';

import { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { addReferral, registerPartner } from '@/app/actions/developer';
import { toast } from 'sonner';

type Partner = {
  id: string;
  full_name: string;
  whatsapp: string;
};

export default function DeveloperActions({ partners }: { partners: Partner[] }) {
  const referralDialogRef = useRef<HTMLDialogElement>(null);
  const partnerDialogRef = useRef<HTMLDialogElement>(null);

  const [referralLoading, setReferralLoading] = useState(false);
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddReferral = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setReferralLoading(true);
    setError('');
    
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const result = await addReferral(formData);
      
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success('Referral berhasil ditambahkan.');
        form.reset();
        referralDialogRef.current?.close();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Referral gagal disimpan. Silakan coba lagi.';
      setError(message);
      toast.error(message);
    } finally {
      setReferralLoading(false);
    }
  };

  const handleRegisterPartner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPartnerLoading(true);
    setError('');
    
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const result = await registerPartner(formData);
      
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success(result?.message || 'Partner berhasil didaftarkan.');
        form.reset();
        partnerDialogRef.current?.close();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Partner gagal didaftarkan. Silakan coba lagi.';
      setError(message);
      toast.error(message);
    } finally {
      setPartnerLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => referralDialogRef.current?.showModal()}
        className="h-card text-left group hover:border-[#1C1C1A] transition-colors"
      >
        <h3 className="font-medium text-[#1C1C1A] mb-2">Tambah Referral Manual</h3>
        <p className="text-sm text-[#738276] mb-6">Input data pendaftar baru dari partner yang tidak terdaftar otomatis.</p>
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F5F5F2] group-hover:bg-[#1C1C1A] group-hover:text-white transition-colors">
          <Plus size={16} />
        </span>
      </button>
      <button 
        onClick={() => partnerDialogRef.current?.showModal()}
        className="h-card text-left group hover:border-[#1C1C1A] transition-colors"
      >
        <h3 className="font-medium text-[#1C1C1A] mb-2">Daftarkan Partner</h3>
        <p className="text-sm text-[#738276] mb-6">Buat akun akses untuk partner baru ke dalam sistem dashboard.</p>
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F5F5F2] group-hover:bg-[#1C1C1A] group-hover:text-white transition-colors">
          <Plus size={16} />
        </span>
      </button>

      {/* Tambah Referral Modal */}
      <dialog ref={referralDialogRef} className="p-0 rounded-2xl bg-white backdrop:bg-black/50 w-full max-w-md m-auto border border-[#E8E8E4] shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="heading-3 text-[#1C1C1A]">Tambah Referral Manual</h2>
            <button type="button" onClick={() => { referralDialogRef.current?.close(); setError(''); }} className="text-[#738276] hover:text-[#1C1C1A]">
              <X size={20} />
            </button>
          </div>
          {error && <p className="text-[#B94A48] text-sm mb-4 bg-[#B94A48]/10 p-3 rounded">{error}</p>}
          <form onSubmit={handleAddReferral} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A48] mb-1">Partner Referral</label>
              <select name="partner_id" required className="h-input w-full bg-transparent">
                <option value="">Pilih Partner</option>
                {partners.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name} ({p.whatsapp})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A4A48] mb-1">Nama Pendaftar</label>
              <input type="text" name="pendaftar_name" required className="h-input w-full bg-transparent" placeholder="Cth: Budi Santoso" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A4A48] mb-1">Nominal Komisi (Rp)</label>
              <input type="number" name="amount" required className="h-input w-full bg-transparent" placeholder="Cth: 50000" />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => { referralDialogRef.current?.close(); setError(''); }} className="px-4 py-2 text-sm font-medium text-[#4A4A48] hover:bg-[#F5F5F2] rounded-full transition-colors">
                Batal
              </button>
              <button type="submit" disabled={referralLoading} className="h-btn bg-[#1C1C1A] text-white hover:bg-[#1C1C1A]/90 disabled:opacity-50 border-none">
                {referralLoading ? 'Menyimpan...' : 'Simpan Referral'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Daftarkan Partner Modal */}
      <dialog ref={partnerDialogRef} className="p-0 rounded-2xl bg-white backdrop:bg-black/50 w-full max-w-md m-auto border border-[#E8E8E4] shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="heading-3 text-[#1C1C1A]">Daftarkan Partner Baru</h2>
            <button type="button" onClick={() => { partnerDialogRef.current?.close(); setError(''); }} className="text-[#738276] hover:text-[#1C1C1A]">
              <X size={20} />
            </button>
          </div>
          {error && <p className="text-[#B94A48] text-sm mb-4 bg-[#B94A48]/10 p-3 rounded">{error}</p>}
          <form onSubmit={handleRegisterPartner} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A48] mb-1">Nama Lengkap</label>
              <input type="text" name="full_name" required className="h-input w-full bg-transparent" placeholder="Cth: Siti Aminah" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A4A48] mb-1">Nomor WhatsApp (sebagai ID login)</label>
              <input type="text" name="whatsapp" required className="h-input w-full bg-transparent" placeholder="Cth: 08123456789" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A4A48] mb-1">Password Statis</label>
              <input type="password" name="password" required className="h-input w-full bg-transparent" placeholder="Minimal 6 karakter" />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => { partnerDialogRef.current?.close(); setError(''); }} className="px-4 py-2 text-sm font-medium text-[#4A4A48] hover:bg-[#F5F5F2] rounded-full transition-colors">
                Batal
              </button>
              <button type="submit" disabled={partnerLoading} className="h-btn bg-[#1C1C1A] text-white hover:bg-[#1C1C1A]/90 disabled:opacity-50 border-none">
                {partnerLoading ? 'Mendaftarkan...' : 'Daftarkan Partner'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
