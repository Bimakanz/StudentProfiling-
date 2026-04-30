# ⚡ Student Profiling System - Brutalist Edition ⚡

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
![Laravel](https://img.shields.io/badge/laravel-%23FF2D20.svg?style=for-the-badge&logo=laravel&logoColor=white)

Welcome to the **Student Profiling System**! This isn't your average, boring school application. Designed with a **Neobrutalism** aesthetic—bold borders, high contrast, and aggressive drop shadows—this app makes managing student portfolios and certifications look incredibly cool and modern.

## ✨ Fitur Utama (What makes this cool?)
- **🔥 Brutalist UI/UX:** Tampilan anti-mainstream yang mencolok, *edgy*, dan punya karakter kuat.
- **📱 Smooth Drawer Navigation:** Animasi menu geser (slide-in overlay) yang interaktif dan memanjakan mata.
- **📂 Manajemen Portofolio & Sertifikasi:** Catat dan pamerkan pencapaianmu dengan bangga (dilengkapi fitur *Public View* tanpa perlu login!).
- **🔗 Integrasi Sosial Media:** Tautkan GitHub, LinkedIn, dan Instagram langsung ke profilmu untuk *networking*.
- **🛡️ Secure REST API:** Dibekingi oleh ketangguhan framework Laravel di sisi server.

---

## 🛠️ Tech Stack
- **Frontend:** React Native, Expo, Expo Router
- **Backend:** PHP, Laravel 11, MySQL
- **State/Storage:** React `useState`, AsyncStorage

---

## 🚀 Cara Instalasi & Menjalankan Aplikasi

Aplikasi ini terbagi menjadi dua bagian: **Backend (Laravel)** dan **Frontend (React Native/Expo)**. Ikuti langkah di bawah ini untuk menjalankan semuanya di mesin lokalmu!

### 🟢 Tahap 1: Setup Backend (Laravel)
Pastikan kamu sudah menginstal PHP, Composer, dan MySQL (bisa pakai XAMPP/Laragon).

1. Buka terminal dan masuk ke folder backend:
   ```bash
   cd ProfilingSiswa
   ```
2. Instal semua *dependency* PHP:
   ```bash
   composer install
   ```
3. Salin file konfigurasi env, lalu atur koneksi databasemu:
   ```bash
   cp .env.example .env
   ```
   *Edit file `.env`, pastikan `DB_DATABASE` sesuai dengan nama database kosong yang sudah kamu buat di MySQL.*
4. *Generate app key* dan jalankan migrasi database:
   ```bash
   php artisan key:generate
   php artisan migrate:fresh --seed
   ```
   *(Catatan: `--seed` akan otomatis memasukkan data dummy agar kamu langsung punya user untuk ujicoba login).*
5. Jalankan server Laravel:
   ```bash
   php artisan serve --host=0.0.0.0 --port=8000
   ```
   > **Penting:** Gunakan `--host=0.0.0.0` agar API bisa diakses dari jaringan lokal (HP atau Emulator) melalui IP Address komputermu.

### 🟠 Tahap 2: Setup Frontend (React Native / Expo)
Pastikan kamu sudah menginstal Node.js dan aplikasi Expo Go di HP kamu (atau bisa pakai Emulator Android/iOS).

1. Buka terminal baru dan masuk ke folder frontend:
   ```bash
   cd APIProfilingSiswa
   ```
2. Instal semua *dependency* NPM:
   ```bash
   npm install
   ```
3. **Konfigurasi Alamat IP (PENTING!):**
   Cari file tempat `API_URL` dideklarasikan (biasanya di file seperti `app/(tabs)/Home.tsx` atau `app/Start/Login.tsx`), dan pastikan IP-nya mengarah ke **IP Address komputermu (IPv4)**, BUKAN `localhost`.
   Contoh: 
   ```typescript
   const API_URL = 'http://192.168.1.5:8000/api'; // Ganti dengan IP kamu
   ```
4. Jalankan aplikasi Expo:
   ```bash
   npx expo start
   ```
   *atau*
   ```bash
   npm start
   ```
5. **Scan QR Code** yang muncul di terminal menggunakan aplikasi Expo Go di HP kamu. Voila! Aplikasi siap untuk dijelajahi!

---

## 🤝 Kontribusi (Let's make it more brutal!)
Punya ide gila untuk membuat desainnya lebih "Brutal" atau ingin menambah fitur baru? Silakan *fork* repository ini, buat *branch* baru, dan ajukan *Pull Request*. Segala bentuk kontribusi sangat kami hargai!

---
*Dibuat dengan ☕ dan 🖤 untuk ekosistem pendidikan yang lebih baik.*
