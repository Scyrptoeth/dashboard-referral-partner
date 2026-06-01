# Project Memory: Dashboard Referral Partner Persiapantubel

Dokumen ini mencatat riwayat pengembangan, *lessons learned*, dan rencana kerja proyek.

---

## Log Tanggal: 1 Juni 2026

### 1. Rangkuman Pekerjaan Terkini
- **Inisialisasi Proyek:** Setup Next.js 16 (App Router), Supabase SSR, dan Tailwind CSS v4. Penyusunan `GRAND_DESIGN.md` yang berfungsi sebagai *Single Source of Truth*.
- **Database & Auth Automations:** Skema lengkap (`profiles`, `referrals`, `payments`, `reward_configs`, `feedback`) lengkap dengan tipe Enum, RLS (*Row Level Security*), dan trigger otomatis. Menggunakan pendekatan **Virtual Identity** (WA + domain internal `@persiapantubel.com`) agar login dari sisi UI murni 100% nomor WhatsApp. Pembuatan akun *root developer* juga diotomatisasi dengan skrip Node (`pg`).
- **Pencarian Desain "Anti-Slop":** 
  - Melewati 3 iterasi radikal (*Technical Brutalist* dan *Avant-Garde Editorial*).
  - Berlabuh pada **Humanist Editorial Minimalism** (*Fraunces* + *DM Sans*, warna *Paper White* #FDFDFB & *Ink Black* #1C1C1A) yang minimalis, elegan, dan menjauhi kesan aplikasi template AI generik.
- **Fungsionalitas Developer Dashboard (CRUD):** Implementasi penuh *Next.js Server Actions* dan komponen UI (Modal) untuk pendaftaran Partner baru (menggunakan Admin API) dan input data Rujukan manual. Fitur ini sudah terintegrasi dan siap digunakan.
- **Manajemen Pencairan (Hybrid Detail):** Selesainya fitur pemrosesan komisi di mana Developer dapat memverifikasi rincian rujukan per partner sebelum menandai pembayaran sebagai "Lunas". Menggunakan komponen `SettlementManager.tsx`.
- **Feedback Anonim:** Implementasi saluran komunikasi searah yang aman dari Partner ke Developer tanpa menyimpan identitas pengirim (privacy-safe).
- **Config Management (Reward UI):** Implementasi modul `RewardConfigEditor.tsx` dan Server Action `updateRewardConfigs` untuk pengelolaan dinamis persentase bonus Top 5.
- **Referral Status Sync & Period Management:** 
    - Penambahan status `'settled'` dan kolom `payment_id` pada rujukan (Opsi A - Audit Trail).
    - Dashboard kini secara otomatis melakukan "Reset" dengan memfilter rujukan yang sudah berstatus `'settled'`, memastikan Leaderboard dan Estimasi Pendapatan hanya mencerminkan periode berjalan yang belum dibayar.
- **Pembersihan Kode & Deployment:** Seluruh rute dashboard telah diperbarui untuk mendukung sistem status baru.

### 2. Evaluasi Lesson Learned (Wawasan Penting)
- **Status-Based Period Reset:** Menggunakan status `'settled'` jauh lebih efisien daripada melakukan penghapusan atau pemindahan data manual ke tabel arsip. Hal ini menjaga integritas data historis di satu tempat (`referrals`) namun tetap memberikan pengalaman "Reset" yang bersih bagi pengguna.
- **Relasi One-to-Many (Payment to Referrals):** Menghubungkan banyak rujukan ke satu ID pembayaran melalui `payment_id` mempermudah proses audit dan rekonsiliasi keuangan di masa mendatang.

### 3. Peta Risiko & Hutang Teknis (Tech Debt)
- **Database Migration Necessity:** Seluruh fitur baru ini bergantung pada SQL Migration untuk enum `referral_status` dan kolom `payment_id`.

### 4. Rumusan Next Action (Tindakan Berikutnya)
1. **[Prioritas 1] Testing & QA:** Verifikasi alur pencairan (settlement) untuk memastikan status rujukan berubah menjadi 'settled' secara atomik.
2. **[Prioritas 2] Password Management:** Membangun fitur ganti password mandiri untuk Partner.
3. **[Prioritas 3] PDF Report:** Ekspor riwayat pembayaran menjadi laporan PDF sederhana bagi Partner.

---