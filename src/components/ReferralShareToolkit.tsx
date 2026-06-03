'use client';

import { useMemo, useState, useTransition } from 'react';
import { Check, Copy, FileText, Link as LinkIcon, MessageCircle, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deletePromoTemplate, savePromoTemplate } from '@/app/actions/promoTemplates';

type PromoTemplateType = 'wa' | 'link' | 'script';

type PromoTemplate = {
  id: string;
  type: PromoTemplateType;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
};

type DraftTemplate = {
  id?: string;
  type: PromoTemplateType;
  title: string;
  content: string;
};

type ShareToolkitProps = {
  partnerName: string;
  whatsapp: string;
  initialTemplates: PromoTemplate[];
};

const tabs = [
  { id: 'wa', label: 'Tautan WA', icon: MessageCircle },
  { id: 'link', label: 'Link Landing', icon: LinkIcon },
  { id: 'script', label: 'Skrip Promo', icon: FileText },
] as const;

const defaultTitles: Record<PromoTemplateType, string> = {
  wa: 'Template WhatsApp Default',
  link: 'Link Landing Default',
  script: 'Skrip Promo Default',
};

function normalizeWhatsapp(whatsapp: string) {
  return whatsapp.startsWith('0') ? `62${whatsapp.slice(1)}` : whatsapp;
}

function getDefaults(partnerName: string, whatsapp: string): Record<PromoTemplateType, string> {
  const waNumber = normalizeWhatsapp(whatsapp);
  const landingLink = `https://persiapantubel.com?partner=${encodeURIComponent(partnerName)}`;
  const waMessage = `Halo, saya tertarik mendaftar Bimbel Persiapantubel melalui rekomendasi Kamu (${partnerName}). Mohon info selengkapnya.`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  return {
    wa: waMessage,
    link: landingLink,
    script: `*Bimbel Persiapantubel - Pendaftaran Dibuka!*

Dapatkan persiapan terbaik untuk Ujian Kompetensi & Grading DJP. Belajar lebih efektif dengan bank soal terakreditasi dan tutor ahli.

Gunakan kode referral saya saat mendaftar:
${partnerName.toUpperCase()}

Klik untuk info selengkapnya:
${landingLink}

Atau hubungi saya langsung:
${waLink}`,
  };
}

function createBlankDraft(type: PromoTemplateType, partnerName: string, whatsapp: string): DraftTemplate {
  const defaults = getDefaults(partnerName, whatsapp);

  return {
    type,
    title: `Template ${tabs.find((tab) => tab.id === type)?.label || 'Promo'} Baru`,
    content: defaults[type],
  };
}

function renderTemplate(content: string, partnerName: string, whatsapp: string) {
  const waNumber = normalizeWhatsapp(whatsapp);
  return content
    .replaceAll('{partnerName}', partnerName)
    .replaceAll('{partner_name}', partnerName)
    .replaceAll('{whatsapp}', whatsapp)
    .replaceAll('{waNumber}', waNumber)
    .replaceAll('{wa_number}', waNumber);
}

function getShareOutput(type: PromoTemplateType, content: string, partnerName: string, whatsapp: string) {
  const rendered = renderTemplate(content, partnerName, whatsapp);

  if (type === 'wa') {
    return `https://wa.me/${normalizeWhatsapp(whatsapp)}?text=${encodeURIComponent(rendered)}`;
  }

  return rendered;
}

export default function ReferralShareToolkit({ partnerName, whatsapp, initialTemplates }: ShareToolkitProps) {
  const [activeTab, setActiveTab] = useState<PromoTemplateType>('wa');
  const [templates, setTemplates] = useState<PromoTemplate[]>(initialTemplates);
  const [selectedId, setSelectedId] = useState<string>('default-wa');
  const [draft, setDraft] = useState<DraftTemplate>({
    type: 'wa',
    title: defaultTitles.wa,
    content: getDefaults(partnerName, whatsapp).wa,
  });
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const defaultContent = useMemo(() => getDefaults(partnerName, whatsapp), [partnerName, whatsapp]);
  const filteredTemplates = templates.filter((template) => template.type === activeTab);
  const output = getShareOutput(activeTab, draft.content, partnerName, whatsapp);

  const selectDefault = (type: PromoTemplateType) => {
    setSelectedId(`default-${type}`);
    setDraft({
      type,
      title: defaultTitles[type],
      content: defaultContent[type],
    });
  };

  const handleTabChange = (type: PromoTemplateType) => {
    setActiveTab(type);
    selectDefault(type);
    setCopied(false);
  };

  const handleSelectTemplate = (template: PromoTemplate) => {
    setSelectedId(template.id);
    setDraft({
      id: template.id,
      type: template.type,
      title: template.title,
      content: template.content,
    });
    setCopied(false);
  };

  const handleNewTemplate = () => {
    const newDraft = createBlankDraft(activeTab, partnerName, whatsapp);
    setSelectedId('new');
    setDraft(newDraft);
    setCopied(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Berhasil disalin ke clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await savePromoTemplate(draft);

      if (result.error || !result.template) {
        toast.error(result.error || 'Template gagal disimpan.');
        return;
      }

      const saved = result.template as PromoTemplate;
      setTemplates((current) => {
        const exists = current.some((template) => template.id === saved.id);
        return exists
          ? current.map((template) => (template.id === saved.id ? saved : template))
          : [saved, ...current];
      });
      setSelectedId(saved.id);
      setDraft({
        id: saved.id,
        type: saved.type,
        title: saved.title,
        content: saved.content,
      });
      toast.success('Template berhasil disimpan.');
    });
  };

  const handleDelete = () => {
    if (!draft.id) return;

    startTransition(async () => {
      const result = await deletePromoTemplate(draft.id!);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setTemplates((current) => current.filter((template) => template.id !== draft.id));
      selectDefault(activeTab);
      toast.success('Template berhasil dihapus.');
    });
  };

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-[#E8E8E4] bg-white">
      <div className="flex border-b border-[#E8E8E4]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-4 text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#FDFDFB] text-[#1C1C1A] border-b-2 border-[#1C1C1A]'
                : 'text-[#738276] hover:bg-[#FDFDFB]'
            }`}
          >
            <tab.icon size={14} />
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid min-w-0 gap-0 2xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="min-w-0 border-b border-[#E8E8E4] bg-[#FDFDFB] p-5 2xl:border-b-0 2xl:border-r">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-widest text-[#738276]">Daftar Template</p>
            <button
              type="button"
              onClick={handleNewTemplate}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E8E8E4] bg-white text-[#1C1C1A] transition-colors hover:bg-[#F5F5F2]"
              title="Tambah template"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => selectDefault(activeTab)}
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                selectedId === `default-${activeTab}`
                  ? 'border-[#1C1C1A] bg-white'
                  : 'border-[#E8E8E4] bg-[#F5F5F2] hover:bg-white'
              }`}
            >
              <p className="text-sm font-medium text-[#1C1C1A]">{defaultTitles[activeTab]}</p>
              <p className="mt-1 text-xs text-[#738276]">Template bawaan developer.</p>
            </button>

            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleSelectTemplate(template)}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  selectedId === template.id
                    ? 'border-[#1C1C1A] bg-white'
                    : 'border-[#E8E8E4] bg-[#F5F5F2] hover:bg-white'
                }`}
              >
                <p className="truncate text-sm font-medium text-[#1C1C1A]">{template.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#738276]">{template.content}</p>
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0 space-y-6 p-5 md:p-8">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <label className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-widest text-[#738276]">Nama Template</span>
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                className="h-12 w-full rounded-xl border border-[#E8E8E4] bg-[#FDFDFB] px-4 text-sm text-[#1C1C1A] outline-none transition-colors focus:border-[#1C1C1A]"
              />
            </label>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1C1C1A] px-5 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />
                {isPending ? 'Menyimpan' : 'Simpan'}
              </button>
              {draft.id && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#E8E8E4] text-[#9F3A33] transition-colors hover:bg-[#9F3A33]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  title="Hapus template"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-widest text-[#738276]">Isi Template</span>
            <textarea
              value={draft.content}
              onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
              rows={activeTab === 'script' ? 10 : 5}
              className="min-h-32 w-full resize-y rounded-xl border border-[#E8E8E4] bg-[#FDFDFB] p-4 text-sm leading-relaxed text-[#1C1C1A] outline-none transition-colors focus:border-[#1C1C1A]"
            />
          </label>

          <div className="rounded-2xl border border-[#E8E8E4] bg-[#F5F5F2] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-widest text-[#738276]">Preview Siap Pakai</p>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-[#1C1C1A] transition-colors hover:bg-[#FDFDFB]"
              >
                {copied ? <Check size={16} className="text-[#4A7356]" /> : <Copy size={16} />}
                Salin
              </button>
            </div>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all font-sans text-sm leading-relaxed text-[#1C1C1A]">
              {output}
            </pre>
          </div>

          <p className="text-xs leading-relaxed text-[#738276]">
            Variabel yang bisa dipakai: {'{partnerName}'}, {'{whatsapp}'}, dan {'{waNumber}'}. Pada tab Tautan WA, isi template akan otomatis diubah menjadi link WhatsApp dengan pesan siap kirim.
          </p>
        </div>
      </div>
    </div>
  );
}
