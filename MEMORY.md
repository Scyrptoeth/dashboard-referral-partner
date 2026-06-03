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

## Log Tanggal: 3 Juni 2026

### 1. Rangkuman Pekerjaan Terkini
- **Otentikasi & Manajemen Sesi:** 
    - Menyelesaikan bug **Logout 404** dengan membuat *route handler* `src/app/auth/signout/route.ts` yang menangani pembersihan sesi server-side secara benar.
    - Memperbaiki **Infinite Redirect Loop** dan "Session Desync" di middleware dengan bermigrasi dari `getSession()` (yang rentan terhadap sesi basi/stale) ke **`getUser()`** untuk validasi identitas dan JWT token secara *real-time* ke server Supabase.
    - Memastikan middleware mengambil rujukan peran (role) langsung dari database (`profiles`), menghindari konflik dengan *user metadata* lama.
- **Perbaikan Stabilitas Build (Vercel):**
    - Mendeteksi dan menginstal dependensi produksi yang hilang namun digunakan dalam kode (Missing Dependencies: `zod`, `sonner`, `recharts`), mencegah kegagalan build statis/dinamis di lingkungan Vercel.
    - Mengatasi isu TypeScript dan linting (ESLint) seperti *type mismatch* pada `.reduce()`, error *ZodError.issues*, dan *unescaped entities* di file komponen antarmuka.
    - Memindahkan ekspor `metadata` dari Client Component ke Server Component (Layout) pada halaman login untuk memenuhi aturan arsitektur Next.js (App Router).
- **Penyesuaian Tone Komunikasi (Brand Voice):**
    - Mengganti seluruh sapaan kaku "Anda" menjadi **"Kamu"** secara menyeluruh di 15 titik *source code* (Dashboard, Pengaturan, Alat Promosi, Login, Umpan Balik) demi menjaga nuansa keakraban relasi antara Persiapantubel dan mitra referral.
- **Pemulihan Hak Akses (Diagnostic & Fix):**
    - Menganalisa dan menuntaskan anomali *Akun Ditangguhkan/Tidak Ditemukan* di Vercel dengan menyusun skrip *Seed/Diagnostic* (`audit-db.ts` & `check-and-fix-auth.ts`).
    - Menyinkronkan secara paksa Supabase Auth ID dengan tabel `profiles` secara langsung dari Vercel/Node environment, yang berhasil mengaktifkan kembali peran Developer untuk nomor WhatsApp `082294116001`.

### 2. Evaluasi Lesson Learned (Wawasan Penting)
- **getUser() vs getSession():** Dalam Next.js App Router (khususnya middleware keamanan), selalu gunakan `getUser()` untuk memastikan kepastian identitas yang divalidasi oleh server. Penggunaan `getSession()` berisiko menimbulkan *race conditions* dan *infinite redirect loops* jika cookie yang tersimpan di klien kedaluwarsa atau dimanipulasi.
- **Global Dependencies Trap:** Sangat krusial untuk rutin mengaudit dan mendeklarasikan paket dalam `package.json` yang sering kali luput terdeteksi pada *local dev environment* karena bergantung pada tembolok *node_modules* yang ada secara kebetulan/global. Kesalahan ini langsung memicu kegagalan di *CI/CD pipeline* seperti Vercel.

### 3. Peta Risiko & Hutang Teknis (Tech Debt)
- **Supabase Local State:** Skema RLS database `profiles` kini lebih longgar terhadap `authenticated` guna mendukung verifikasi awal oleh middleware. Diperlukan pengawasan jika model data mitra kelak menjadi sangat besar.

### 4. Rumusan Next Action (Tindakan Berikutnya)
1. **[Prioritas 1] Pengujian Beban Autentikasi:** Mendaftarkan pengguna profil "Partner" biasa guna menjamin fungsionalitas pemisahan role Developer vs Partner berfungsi paripurna tanpa *redirect* nyasar.
2. **[Prioritas 2] Ekspor Data (Laporan CSV/PDF):** Menyediakan fitur bagi Developer untuk mengunduh laporan payout dan referral untuk pembukuan bulanan.
3. **[Prioritas 3] Pencarian Tabel:** Implementasi fitur "Search/Filter" global di halaman Admin Partner dan Admin Referrals guna memudahkan operasi pengelolaan manual.

---

## Log Tanggal: 3 Juni 2026 - Sesi Perbaikan Layout 100% Browser

### 1. Rangkuman Pekerjaan Terkini
- **Perbaikan Layout Dashboard Partner:** Menghapus batas `max-w-5xl mx-auto` pada wrapper utama dashboard dan menggantinya dengan container full-width responsif (`w-full`, padding bertingkat, dan `min-w-0`) agar tampilan browser 100% tidak lagi menyisakan ruang kosong besar di kiri dan kanan.
- **Perbaikan UX Referral Share Toolkit:** Menyesuaikan `ReferralShareToolkit` agar panel daftar template dan editor promo tidak memaksa layout dua kolom pada ruang yang sempit. Layout kini stack ke bawah sampai breakpoint `2xl`, lalu baru memakai dua kolom ketika ruang layar cukup.
- **Pencegahan Overflow Horizontal:** Menambahkan `min-w-0` pada grid dan panel editor, serta mengganti preview output menjadi `break-all` agar URL WhatsApp panjang tidak memotong tampilan atau membutuhkan scroll kanan halaman.
- **GitHub & Vercel Production:** Commit `feae3e0` (`fix(dashboard): improve responsive promo layout`) berhasil di-merge ke `main`, push ke GitHub sukses, dan deployment production Vercel terbaru berstatus **Ready**. Alias live: `https://partner-persiapantubel.vercel.app`.

### 2. Evaluasi Lesson Learned (Wawasan Penting)
- **Responsive Dashboard Tidak Cukup Dengan Max-Width:** Untuk dashboard operasional, container yang terlalu sempit dapat membuat layar besar terasa kosong dan mengurangi efisiensi visual. Wrapper utama perlu mengikuti lebar area kerja sambil tetap menjaga padding yang proporsional.
- **Breakpoint Dua Kolom Harus Berdasar Ruang Nyata:** Komponen editor yang memiliki textarea, input, tombol aksi, dan preview panjang lebih aman dibuat stack pada layar sedang. Dua kolom baru ideal ketika lebar efektif benar-benar cukup, bukan hanya karena sudah masuk breakpoint desktop standar.

### 3. Peta Risiko & Hutang Teknis (Tech Debt)
- **Verifikasi Visual Terproteksi Login:** Verifikasi dashboard aktual dengan akun partner production belum dilakukan karena kredensial tidak tersedia dan tidak aman untuk menebak/mengubah akun. Verifikasi dilakukan melalui build, lint, dan Playwright fixture berbasis CSS build untuk memvalidasi overflow serta perilaku responsif.
- **Vercel SSO Pada Deployment Hash:** URL deployment hash Vercel mengembalikan proteksi SSO/401, tetapi alias production `partner-persiapantubel.vercel.app` merespons normal dan mengarahkan user belum login ke `/login`.

### 4. Rumusan Next Action (Tindakan Berikutnya)
1. **[Prioritas 1] Verifikasi UI Dengan Akun Partner Nyata:** Login ke production sebagai Partner dan cek langsung halaman `/dashboard/partner` pada browser 100%, 125%, tablet, dan mobile.
2. **[Prioritas 2] Audit Responsif Halaman Developer:** Terapkan pola `min-w-0`, wrapping, dan layout stack yang sama pada tabel/komponen developer yang berisiko overflow horizontal.
3. **[Prioritas 3] Dokumentasikan Baseline Screenshot:** Simpan screenshot before/after terkurasi untuk regresi visual layout dashboard berikutnya.

---
