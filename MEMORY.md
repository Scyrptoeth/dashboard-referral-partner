# Project Memory: Dashboard Referral Partner Persiapantubel

Dokumen ini mencatat riwayat pengembangan, *lessons learned*, dan rencana kerja proyek.

---

## Log Tanggal: 1 Juni 2026

### 1. Rangkuman Pekerjaan Terkini
- **Inisialisasi Proyek:** Setup Next.js 16 (App Router), Supabase SSR, dan Tailwind CSS v4. Penyusunan `GRAND_DESIGN.md` sebagai *Single Source of Truth*.
- **Database & Auth Automations:** Skema lengkap (`profiles`, `referrals`, `payments`, `reward_configs`, `feedback`). Implementasi **Virtual Identity** (WA login via internal email) dan pendaftaran Partner via Admin API.
- **Config Management (Reward UI):** Implementasi modul `RewardConfigEditor.tsx` dan Server Action `updateRewardConfigs` untuk pengelolaan dinamis bonus Top 5.
- **Referral Status Sync & Period Management:** 
    - Penambahan status `'settled'` dan kolom `payment_id` pada rujukan (Opsi A - Audit Trail).
    - Dashboard kini otomatis melakukan "Reset" dengan memfilter rujukan yang sudah berstatus `'settled'`, memastikan Leaderboard dan metrik hanya mencerminkan periode aktif.
- **Modular Routing Implementation (Opsi A):**
    - Distribusi fungsionalitas ke sub-route: `/dashboard/payouts`, `/dashboard/feedback`, `/dashboard/developer/partners`, dan `/dashboard/developer/referrals`.
    - Dashboard utama (`/dashboard/developer` & `/dashboard/partner`) kini berfungsi sebagai **Summary Dashboard** yang elegan dengan metrik ringkas.
    - Resolusi 100% terhadap seluruh broken links 404 pada navigasi.
- **Security Audit & Middleware:** Penegakan otorisasi berbasis role di middleware menggunakan `user_metadata` untuk efisiensi akses dan proteksi sub-route.
- **Leaderboard Accuracy:** Perbaikan logika perankingan agar mengecualikan 3 rujukan pertama per mitra sesuai mandat Grand Design.
- **Pembersihan Kode & Deployment:** Build lokal sukses, sinkronisasi GitHub selesai (`136a127`, `9aec674`), dan deploy ulang ke Vercel Production berhasil.

### 2. Evaluasi Lesson Learned (Wawasan Penting)
- **Status-Based Period Reset:** Menggunakan status `'settled'` jauh lebih efisien daripada pemindahan data manual. Menjaga integritas data historis di satu tempat (`referrals`) sambil memberikan pengalaman "Reset" yang bersih.
- **Modular vs Monolith Dashboard:** Memecah dashboard menjadi sub-route meningkatkan skalabilitas, kemudahan pengelolaan komponen, dan performa pemuatan data per rute.
- **Middleware Role-Aware:** Otorisasi berbasis role di tingkat middleware sangat krusial untuk mencegah akses lintas-dashboard secara aman.

### 3. Peta Risiko & Hutang Teknis (Tech Debt)
- **Database Migration:** Seluruh fitur baru bergantung pada SQL Migration (enum status & kolom `payment_id`) di database produksi Supabase.

### 4. Rumusan Next Action (Tindakan Berikutnya)
1. **[Prioritas 1] Testing & QA:** Verifikasi alur pencairan (settlement) untuk memastikan status rujukan berubah menjadi 'settled' secara atomik di akun nyata.
2. **[Prioritas 2] Password Management:** Membangun fitur ganti password mandiri untuk Partner.
3. [Prioritas 3] PDF Report: Ekspor riwayat pembayaran menjadi laporan PDF sederhana bagi Partner.

---

## Log Tanggal: 2 Juni 2026

### 1. Rangkuman Pekerjaan Terkini
- **Atomic Settlement System (RPC):** Migrasi logika pencairan dana ke **PostgreSQL RPC** (`settle_partner_payments`) untuk menjamin konsistensi ACID antara tabel `payments` dan `referrals`.
- **Administrative Control Panel:** 
    - Implementasi fitur **Reset Password Admin** & **Status Kontrol Partner** (Aktif/Nonaktif) menggunakan Supabase Admin API (`auth.admin`).
    - Fitur **Koreksi Data Rujukan** (Edit) bagi Developer untuk memperbaiki kesalahan input manual pada rujukan yang belum lunas.
- **Data Integrity & Validation:** Pengetatan input menggunakan **Zod** dan Regex WhatsApp Indonesia untuk menjamin validitas *Virtual Identity* dan mencegah data kotor.
- **Advanced Visualization & Metrics:**
    - Integrasi **Recharts** untuk grafik tren rujukan harian pada dashboard Developer dan Partner.
    - Kalkulasi **Reward Top 5 Eksak** yang mengambil data dinamis dari `reward_configs` dan menampilkan estimasi nominal Rupiah.
- **User Experience & Navigation:**
    - Pembangunan route `/dashboard/archive` untuk akses data historis rujukan lunas.
    - Implementasi **Indikator Notifikasi** (unread badge) pada Sidebar Kotak Masuk Developer.
    - Sistem **Skeleton Loading UI** pada seluruh rute utama untuk mengeliminasi *layout shift* (CLS) dan meningkatkan *perceived performance*.
    - Penambahan metadata dinamis pada seluruh rute dashboard untuk optimasi navigasi browser.
- **Security & Session Management:**
    - Penegakan **Security Force Sign-out** di `middleware.ts`. Sistem kini memvalidasi status `is_active` secara real-time dari database; akun yang dinonaktifkan akan segera diputus sesinya dan dialihkan ke login.
- **Partner Growth Toolkit:**
    - Implementasi **Referral Sharing Toolkit** pada Dashboard Partner. Menyediakan generator tautan WhatsApp (wa.me), Landing Page dengan parameter identitas mitra, dan skrip promosi siap sebar dengan integrasi Clipboard API.
- **Modern Notification & Feedback System:**
    - Integrasi **Sonner** sebagai provider toast global. Migrasi seluruh pemanggilan `alert()` browser ke notifikasi toast yang elegan dan non-blocking.
    - Standarisasi respon Server Actions untuk penanganan error yang lebih informatif dan ramah pengguna.

### 2. Evaluasi Lesson Learned (Wawasan Penting)
- **Real-time Auth Enforcement:** Validasi middleware terhadap database (bukan sekadar JWT) sangat krusial untuk aplikasi admin guna memastikan perubahan hak akses oleh pemilik sistem berlaku seketika pada sesi pengguna aktif.
- **Frictionless Sharing:** Menyediakan amunisi promosi dalam berbagai format (WA, Link, Script) dalam satu komponen terpadu secara signifikan menurunkan hambatan bagi mitra untuk mulai melakukan pemasaran.
- **UX Non-blocking:** Migrasi ke sistem Toast (Sonner) sangat meningkatkan kenyamanan operasional karena pengguna tidak lagi terinterupsi oleh dialog modal browser saat melakukan aksi berulang.

### 3. Peta Risiko & Hutang Teknis (Tech Debt)
- **Middleware Database Load:** Pengecekan status profil di setiap permintaan middleware dapat meningkatkan beban database. Perlu dipertimbangkan penggunaan caching atau pengecekan berbasis interval jika trafik meningkat signifikan.
- **Database Schema Sync:** Kolom `is_read` pada tabel `feedback` dan fungsi RPC baru harus dipastikan sudah terpasang di database production Supabase.

### 4. Rumusan Next Action (Tindakan Berikutnya)
1. **[Prioritas 1] WhatsApp Quick Contact:** Integrasi tautan `wa.me` pada tabel admin untuk mempercepat koordinasi dengan mitra.
2. **[Prioritas 2] Global Search & Filtering:** Menambahkan fitur pencarian pada tabel data rujukan dan mitra.
3. **[Prioritas 3] Referral Fraud Prevention:** Menambahkan pengecekan duplikasi pendaftar pada server action rujukan untuk menjaga integritas data.

---