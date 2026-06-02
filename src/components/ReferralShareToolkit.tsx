'use client';

import { useState } from 'react';
import { Copy, Check, MessageCircle, Link as LinkIcon, FileText } from 'lucide-react';
import { toast } from 'sonner';

type ShareToolkitProps = {
  partnerName: string;
  whatsapp: string;
};

export default function ReferralShareToolkit({ partnerName, whatsapp }: ShareToolkitProps) {
  const [activeTab, setActiveTab] = useState<'wa' | 'link' | 'script'>('wa');
  const [copied, setCopied] = useState(false);

  // Format WhatsApp Link
  const waNumber = whatsapp.startsWith('0') ? '62' + whatsapp.slice(1) : whatsapp;
  const waMessage = encodeURIComponent(`Halo, saya tertarik mendaftar Bimbel Persiapantubel melalui rekomendasi Kamu (${partnerName}). Mohon info selengkapnya.`);
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

  // Landing Link
  const landingLink = `https://persiapantubel.com?partner=${encodeURIComponent(partnerName)}`;

  // Promo Script
  const promoScript = `🔥 *Bimbel Persiapantubel - Pendaftaran Dibuka!* 🔥

Dapatkan persiapan terbaik untuk Ujian Kompetensi & Grading DJP. Belajar lebih efektif dengan bank soal terakreditasi dan tutor ahli.

💡 *Gunakan Kode Referral saya saat mendaftar:*
👉 *[ ${partnerName.toUpperCase()} ]*

Klik untuk info selengkapnya:
${landingLink}

Atau hubungi saya langsung:
${waLink}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Berhasil disalin ke clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'wa', label: 'Tautan WA', icon: MessageCircle },
    { id: 'link', label: 'Link Landing', icon: LinkIcon },
    { id: 'script', label: 'Skrip Promo', icon: FileText },
  ] as const;

  return (
    <div className="bg-white rounded-3xl border border-[#E8E8E4] overflow-hidden">
      <div className="flex border-b border-[#E8E8E4]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-[#FDFDFB] text-[#1C1C1A] border-b-2 border-[#1C1C1A]' 
                : 'text-[#738276] hover:bg-[#FDFDFB]'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-8">
        {activeTab === 'wa' && (
          <div className="space-y-6">
            <p className="text-sm text-[#738276] leading-relaxed">
              Gunakan tautan ini agar calon siswa langsung menghubungi WhatsApp Kamu dengan pesan otomatis.
            </p>
            <div className="flex items-center gap-3 p-4 bg-[#F5F5F2] rounded-xl border border-[#E8E8E4]">
              <code className="text-xs text-[#1C1C1A] truncate flex-1">{waLink}</code>
              <button onClick={() => handleCopy(waLink)} className="p-2 text-[#738276] hover:text-[#1C1C1A] transition-colors">
                {copied ? <Check size={18} className="text-[#4A7356]" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'link' && (
          <div className="space-y-6">
            <p className="text-sm text-[#738276] leading-relaxed">
              Bagikan link website resmi Persiapantubel yang sudah dipersonalisasi dengan nama Kamu.
            </p>
            <div className="flex items-center gap-3 p-4 bg-[#F5F5F2] rounded-xl border border-[#E8E8E4]">
              <code className="text-xs text-[#1C1C1A] truncate flex-1">{landingLink}</code>
              <button onClick={() => handleCopy(landingLink)} className="p-2 text-[#738276] hover:text-[#1C1C1A] transition-colors">
                {copied ? <Check size={18} className="text-[#4A7356]" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'script' && (
          <div className="space-y-6">
            <p className="text-sm text-[#738276] leading-relaxed">
              Skrip promosi siap sebar ke grup WhatsApp atau media sosial lainnya.
            </p>
            <div className="relative p-4 bg-[#F5F5F2] rounded-xl border border-[#E8E8E4]">
              <pre className="text-[10px] text-[#1C1C1A] whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                {promoScript}
              </pre>
              <button 
                onClick={() => handleCopy(promoScript)} 
                className="absolute right-4 top-4 p-2 bg-white rounded-lg shadow-sm text-[#738276] hover:text-[#1C1C1A] transition-colors border border-[#E8E8E4]"
              >
                {copied ? <Check size={18} className="text-[#4A7356]" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
