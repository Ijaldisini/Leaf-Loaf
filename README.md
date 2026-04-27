# 🥪 Leaf n Loaff

**Platform Inovasi Pemesanan Sandwich Sehat**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.10-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

## 📖 Deskripsi Proyek

**Leaf & Loaf** adalah platform web modern yang inovatif untuk pemesanan sandwich sehat. Platform ini dirancang untuk menjangkau pasar yang luas dengan menghadirkan pengalaman pemesanan yang unik melalui sistem *batch* dan visualisasi produk menggunakan elemen 3D interaktif. 

Dengan antarmuka yang bersih dan responsif, pelanggan dapat dengan mudah menelusuri menu, melihat detail produk, menyesuaikan pesanan, dan melakukan proses checkout secara mulus.

---

## 🚀 Tech Stack

### Frontend & UI
- **Framework:** React 19 dengan Vite untuk performa build yang cepat
- **Styling:** Tailwind CSS v4 & App.css kustom
- **Routing:** React Router v7
- **Icons:** React Icons
- **Visualisasi 3D:** Dukungan format GLB/Blender untuk model sandwich

### Backend & Integrasi
- **BaaS (Backend as a Service):** Supabase (Authentication & Database)
- **Maps:** Leaflet & React-Leaflet untuk pemetaan lokasi
- **Payments:** Mendukung integrasi QRIS

---

## ✨ Fitur Utama

- 📦 **Sistem Pemesanan Batch** - Pemesanan terstruktur berdasarkan sistem *batch* produksi.
- 🥪 **Model 3D Interaktif** - Pengalaman pengguna yang imersif dengan animasi *hover* pada model 3D sandwich.
- 📝 **Catatan Kustomisasi (Notes)** - Fitur *notes* bagi pelanggan untuk menambahkan permintaan khusus pada pesanan.
- ⭐ **Testimoni per Batch** - Menampilkan ulasan dan pengalaman pelanggan dari setiap batch yang telah berjalan.
- 🗺️ **Integrasi Peta** - Menggunakan peta interaktif untuk menampilkan lokasi atau rute menggunakan Leaflet.
- 🎨 **Cursor Effect & Animasi** - Tampilan UI modern dengan efek kursor dinamis (SplashCursor).

---

## 📁 Struktur Proyek

```text
leaf-n-loaf/
├── public/                 # Asset statis (Image, Background, Logo)
│   ├── id-card-daffa.png
│   ├── id-card-habibah.png
│   ├── id-card-natasya.png
│   ├── id-card-radit.png
│   ├── qris.jpeg
│   └── ...
├── src/                    # Source Code Utama
│   ├── components/         # Reusable UI Components
│   │   └── CursorEffect.jsx
│   ├── config/             # Konfigurasi Layanan Pihak Ketiga
│   │   └── supabaseClient.js
│   ├── pages/              # Halaman Aplikasi
│   │   ├── AdminDashboard.jsx
│   │   ├── Checkout.jsx
│   │   ├── Home.jsx
│   │   ├── Profile.jsx
│   │   ├── SplashCursor.jsx
│   │   └── SuccessPage.jsx
│   ├── styles/             # Global dan Theme CSS
│   │   └── theme.css
│   ├── App.jsx             # Main Application Component
│   ├── index.css           # Tailwind & Base Styles
│   └── main.jsx            # Entry Point
├── .env                    # Environment Variables
├── package.json            # Dependencies & Scripts
├── tailwind.config.js      # Konfigurasi Tailwind (via @tailwindcss/vite)
└── vite.config.js          # Konfigurasi Vite Build Tool
```

---

## 🔧 Instalasi & Setup
Prerequisites
- Node.js (versi 18+)
- npm atau yarn
- Akun Supabase

### 1. Clone Repository
```bash
git clone [https://github.com/Ijaldisini/leaf-loaf.git](https://github.com/Ijaldisini/leaf-loaf.git)
cd leaf-loaf
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Buat file (`.env`) di root direktori proyek dan tambahkan konfigurasi Supabase Anda:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Menjalankan Development Server
```bash
npm run dev
```

ℹ️ Info: Aplikasi akan berjalan di (`http://localhost:5173`)

### 5. Build untuk Produksi
```bash
npm run build
```

---

## 🎨 Halaman Utama (Pages)
- Home: Landing page interaktif yang menampilkan menu sandwich unggulan dengan dukungan visual cantik dan testimoni batch.
- Checkout: Proses pemesanan dengan form detail pelanggan, fitur notes untuk request, dan integrasi QRIS.
- Success Page: Halaman konfirmasi setelah transaksi berhasil diselesaikan.
- Profile: Menampilkan kartu ID dari tim pengembang aplikasi.
- Admin Dashboard: Panel manajemen bagi pengelola untuk memantau pesanan per batch.

---

<div align="center">
  
**Leaf n Loaff** - Healthy Sandwiches for Everyone

© 2026 Leaf n Loaff. All rights reserved.

<div>
