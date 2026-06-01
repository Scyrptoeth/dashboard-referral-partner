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
- **Pembersihan Kode & Deployment:** Seluruh error linting telah diperbaiki (tipe 'any' di dashboard partner, unused imports), kode telah di-*push* ke GitHub (`feat: implement partner registration...`), dan build lokal terverifikasi sukses.
- **Konfigurasi Environment Vercel:** `SUPABASE_SERVICE_ROLE_KEY` telah berhasil dipasang secara otomatis ke semua environment Vercel (Production, Preview, Development) menggunakan Vercel CLI, memastikan fitur registrasi berjalan di situs *live*.

### 2. Evaluasi Lesson Learned (Wawasan Penting)
- **Supabase Auth via Phone/WA (Bypass):** Supabase secara bawaan sangat mengikat pada "Email". Melakukan validasi *Virtual Email* di *client-side* (menambah `@persiapantubel.com` sebelum di-*post* ke auth) adalah teknik *workaround* terbaik untuk menyediakan login "Hanya Nomor WhatsApp" tanpa perlu biaya langganan SMS OTP (Supabase Twilio) dan tetap mendapatkan sistem keamanan *hash password* yang tangguh.
- **Admin API untuk Registrasi:** Menggunakan `auth.admin.createUser` dengan `service_role_key` sangat krusial agar Developer dapat mendaftarkan Partner baru tanpa terkeluar dari sesinya sendiri (karena registrasi publik biasanya otomatis melakukan login).
- **Automatisasi Env via CLI:** Menggunakan Vercel CLI untuk menyuntikkan *Environment Variables* terbukti lebih cepat dan akurat daripada konfigurasi manual via dashboard web, terutama saat menangani kunci sensitif yang panjang.

### 3. Peta Risiko & Hutang Teknis (Tech Debt)
- Fitur Manajemen Pencairan (tabel `payments`) masih berupa UI statis di dashboard developer.
- Komponen Form untuk Umpan Balik Anonim (Feedback) belum dibangun secara visual maupun logika fungsinya.

### 4. Rumusan Next Action (Tindakan Berikutnya)
1. **[Prioritas 1] Manajemen Pencairan:** Bangun *view* "Pencairan Dana" agar Developer dapat menandai tagihan komisi sebagai "Lunas" (mengubah status tabel `payments`).
2. **[Prioritas 2] Fitur Feedback:** Kembangkan antarmuka dan *backend logic* untuk Partner agar mereka dapat mengirimkan keluhan/saran yang masuk ke tabel `feedback`.

---