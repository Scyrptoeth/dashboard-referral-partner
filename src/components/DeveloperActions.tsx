'use client';

import { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { addReferral, registerPartner } from '@/app/actions/developer';

type Partner = {
  id: string;
  full_name: string;
  whatsapp: string;
};

export default function DeveloperActions({ partners }: { partners: Partner[] }) {
  const referralDialogRef = useRef<HTMLDialogElement>(null);
  const partnerDialogRef = useRef<HTMLDialogElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddReferral = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const result = await addReferral(formData);
    
    if (result.error) {
      setError(result.error);
    } else {
      e.currentTarget.reset();
      referralDialogRef.current?.close();
    }
    setLoading(false);
  };

  const handleRegisterPartner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const result = await registerPartner(formData);
    
    if (result.error) {
      setError(result.error);
    } else {
      e.currentTarget.reset();
      partnerDialogRef.current?.close();
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => referralDialogRef.current?.showModal()}
        className="h-card text-left group hover:border-[#1C1C1A] transition-colors"
      >
        <h3 className="font-medium text-[#1C1C1A] mb-2">Tambah Rujukan Manual</h3>
        <p className="text-sm text-[#738276] mb-6">Input data pendaftar baru dari mitra yang tidak terdaftar otomatis.</p>
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F5F5F2] group-hover:bg-[#1C1C1A] group-hover:text-white transition-colors">
          <Plus size={16} />
        </span>
      </button>
      <button 
        onClick={() => partnerDialogRef.current?.showModal()}
        className="h-card text-left group hover:border-[#1C1C1A] transition-colors"
      >
        <h3 className="font-medium text-[#1C1C1A] mb-2">Daftarkan Mitra</h3>
        <p className="text-sm text-[#738276] mb-6">Buat akun akses untuk mitra baru ke dalam sistem dashboard.</p>
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F5F5F2] group-hover:bg-[#1C1C1A] group-hover:text-white transition-colors">
          <Plus size={16} />
        </span>
      </button>

      {/* Tambah Rujukan Modal */}
      <dialog ref={referralDialogRef} className="p-0 rounded-2xl bg-white backdrop:bg-black/50 w-full max-w-md m-auto border border-[#E8E8E4] shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="heading-3 text-[#1C1C1A]">Tambah Rujukan Manual</h2>
            <button type="button" onClick={() => { referralDialogRef.current?.close(); setError(''); }} className="text-[#738276] hover:text-[#1C1C1A]">
              <X size={20} />
            </button>
          </div>
          {error && <p className="text-[#B94A48] text-sm mb-4 bg-[#B94A48]/10 p-3 rounded">{error}</p>}
          <form onSubmit={handleAddReferral} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A48] mb-1">Mitra Referral</label>
              <select name="partner_id" required className="h-input w-full bg-transparent">
                <option value="">Pilih Mitra</option>
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
              <button type="submit" disabled={loading} className="h-btn bg-[#1C1C1A] text-white hover:bg-[#1C1C1A]/90 disabled:opacity-50 border-none">
                {loading ? 'Menyimpan...' : 'Simpan Rujukan'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Daftarkan Mitra Modal */}
      <dialog ref={partnerDialogRef} className="p-0 rounded-2xl bg-white backdrop:bg-black/50 w-full max-w-md m-auto border border-[#E8E8E4] shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="heading-3 text-[#1C1C1A]">Daftarkan Mitra Baru</h2>
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
              <button type="submit" disabled={loading} className="h-btn bg-[#1C1C1A] text-white hover:bg-[#1C1C1A]/90 disabled:opacity-50 border-none">
                {loading ? 'Mendaftarkan...' : 'Daftarkan Mitra'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
