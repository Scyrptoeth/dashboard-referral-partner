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
- **Fungsionalitas Leaderboard:** Papan peringkat untuk Dashboard Partner ditingkatkan dari Top 5 menjadi **Top 7 mitra terbaik**.
- **Infrastruktur DevOps:** Proyek telah otomatis terhubung ke repositori GitHub dan sukses tayang secara *Live* (*production*) di Vercel.

### 2. Evaluasi Lesson Learned (Wawasan Penting)
- **Supabase Auth via Phone/WA (Bypass):** Supabase secara bawaan sangat mengikat pada "Email". Melakukan validasi *Virtual Email* di *client-side* (menambah `@persiapantubel.com` sebelum di-*post* ke auth) adalah teknik *workaround* terbaik untuk menyediakan login "Hanya Nomor WhatsApp" tanpa perlu biaya langganan SMS OTP (Supabase Twilio) dan tetap mendapatkan sistem keamanan *hash password* yang tangguh.
- **Spektrum "Anti-Slop" Desain:** Menghindari *AI Slop* tidak selalu berarti membuat desain yang sangat aneh atau brutalist. Desain *Humanist Editorial* membuktikan bahwa dengan pemilihan *font pairing* berkarakter (*serif & sans*) dan warna *warm off-white*, desain fungsional pun bisa terlihat sangat premium dan seperti dibuat oleh seniman UI.

### 3. Peta Risiko & Hutang Teknis (Tech Debt)
- Saat ini tombol-tombol utama di dasbor Developer (seperti "Tambah Rujukan Manual", "Daftarkan Mitra", "Kelola Pencairan") **masih bersifat UI Statis**. Belum ada logika *mutation* / *Server Actions* di balik tombol-tombol tersebut.
- Komponen Form untuk Umpan Balik Anonim (Feedback) belum dibangun secara visual maupun logika fungsinya.

### 4. Rumusan Next Action (Tindakan Berikutnya)
1. **[Prioritas 1] CRUD Developer Dashboard:** Implementasikan *Next.js Server Actions* untuk membuat akun Partner baru (dari UI admin) dan form penambahan data Referral (Rujukan) baru ke database.
2. **[Prioritas 2] Manajemen Pencairan:** Bangun *view* "Pencairan Dana" agar Developer dapat menandai tagihan komisi sebagai "Lunas" (mengubah status tabel `payments`).
3. **[Prioritas 3] Fitur Feedback:** Kembangkan antarmuka dan *backend logic* untuk Partner agar mereka dapat mengirimkan keluhan/saran yang masuk ke tabel `feedback`.

---