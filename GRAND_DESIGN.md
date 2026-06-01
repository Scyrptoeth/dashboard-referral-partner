# Grand Design: Dashboard Referral Partner Persiapantubel

## 1. Visi & Objektif
Membangun dashboard transparan yang mandiri (*standalone*) untuk memantau, mengelola, dan menampilkan metrik kinerja serta riwayat pembayaran bagi para Partner Referral Persiapantubel.

## 2. Arsitektur & Tech Stack
- **Framework (Fullstack):** Next.js (App Router)
- **Database & Authentication:** Supabase (PostgreSQL + Auth). Dipilih karena ketangguhan relasional SQL untuk mengelola kalkulasi bertingkat (pengecualian 3 pendaftar pertama) dan kemudahan manajemen data via Supabase Studio.
- **Styling:** Tailwind CSS (dengan UI standar yang elegan dan cepat).
- **Deployment:** Vercel

## 3. Data Model & Siklus Kerja
- **Mekanisme Input:** Transaksional. Developer menginput setiap kali ada penggunaan kode referral secara manual (Nama Pendaftar, Tanggal, dan Partner yang dituju).
- **Siklus Leaderboard:** Berbasis Periode (misalnya bulanan). Ketika komisi dibayarkan, Developer dapat melakukan "Reset Leaderboard" yang akan mengarsipkan data ke periode masa lalu dan mengosongkan periode berjalan.
- **Kalkulasi Komisi Dasar:**
  - 3 orang pertama: Komisi 50% dari harga.
  - Orang ke-4 dan seterusnya: Komisi flat Rp50.000 per orang.
- **Top 5 Reward Kinerja:**
  - Reward tambahan diberikan kepada 5 Partner terbaik dengan persentase: 50% (Peringkat 1), 40% (Peringkat 2), 30% (Peringkat 3), 20% (Peringkat 4), 20% (Peringkat 5).
  - Basis perhitungan reward ini diambil dari total komisi yang mereka hasilkan, **dikecualikan** 3 orang pertama.

## 4. Role & Fitur (Access Control)

### 4.1. Developer (Pemilik Bimbel)
- **Autentikasi:** Login via WhatsApp Number (ID) & Password statis. Mendukung fitur "Ingat Password" dan "Tampilkan Password" (icon mata). Bisa mengganti password.
- **Partner Management:** Membuat akun Partner (sehingga Partner tidak perlu mendaftar mandiri), reset password Partner, dan menonaktifkan akun Partner.
- **Data Entry (Referral):** Update/input data penggunaan Kode Referral (Manual).
- **Payment Management:** Update status pembayaran komisi kepada Partner (Status Lunas/Belum, Nominal yang dibayarkan, Tanggal bayar).
- **Config Management:** Update sistem reward (mengatur persentase, nominal, dan kriteria) secara dinamis agar tidak *hardcode*.
- **Period Management:** Reset Leaderboard (tutup periode/arsip) setelah pembayaran selesai.

### 4.2. Partner
- **Autentikasi:** Login via WhatsApp Number & Password (dari Developer). Mendukung fitur "Ingat Password" dan "Tampilkan Password" (icon mata). Bisa mengganti password.
- **Dashboard Kinerja:** Mengakses Leaderboard Kinerja untuk 5 Partner terbaik.
- **History Pembayaran:** Memantau riwayat pembayaran komisi (status lunas, nominal, kapan dibayarkan).
- **Feedback Anonim:** Mengirimkan *feedback* secara anonim langsung ke Developer (tidak terekspos identitas Partner).

---
*Dokumen ini merupakan panduan utama (Single Source of Truth) untuk seluruh iterasi pengembangan proyek Dashboard Referral Partner Persiapantubel.*