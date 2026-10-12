# Task: Inisialisasi Project ElysiaJS + Drizzle ORM + MySQL dengan Bun

## Ringkasan Proyek
Inisialisasi dan konfigurasi proyek backend API modern berbasis **Bun** dengan framework **ElysiaJS**, ORM **Drizzle**, dan basis data **MySQL**. Proyek ini bertujuan menyediakan boilerplate/fondasi siap pakai untuk pengembangan fitur backend selanjutnya.

---

## Tech Stack
- **Runtime & Package Manager**: Bun
- **Web Framework**: ElysiaJS
- **ORM & Migrations**: Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- **Database Driver**: MySQL (driver seperti `mysql2`)
- **Language**: TypeScript

---

## Langkah-Langkah Implementasi (High-Level)

### 1. Inisialisasi Project & Dependensi
- Jalankan inisialisasi project Bun di root folder jika belum ada (`package.json`, `tsconfig.json`).
- Pasang dependensi utama:
  - `elysia`
  - `drizzle-orm`
  - driver MySQL (misal: `mysql2`)
- Pasang development dependencies:
  - `drizzle-kit`
  - TypeScript types yang relevan (jika diperlukan)

### 2. Konfigurasi Environment & Database Connection
- Buat file template `.env.example` dan `.env` untuk variabel koneksi database MySQL:
  - `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` (atau `DATABASE_URL`).
- Siapkan koneksi database menggunakan Drizzle client yang menghubungkan driver MySQL ke instance Drizzle.
- Buat file konfigurasi Drizzle (`drizzle.config.ts`) untuk migrasi dan schema management.

### 3. Struktur Schema & Migrasi Database
- Rancang struktur folder modular (misal: `src/db/` untuk schema dan koneksi).
- Buat minimal satu contoh schema Drizzle (misal: tabel `users` atau healthcheck table) untuk membuktikan koneksi database berjalan.
- Tambahkan script npm/bun pada `package.json` untuk:
  - Generate schema / migrasi (`drizzle-kit generate`)
  - Jalankan migrasi / push schema (`drizzle-kit migrate` atau `drizzle-kit push`)
  - Drizzle Studio (opsional: `drizzle-kit studio`)

### 4. Setup Server & Routing ElysiaJS
- Buat entry point aplikasi (misal: `src/index.ts`).
- Konfigurasikan server Elysia untuk berjalan pada port tertentu (misal: 3000 atau dari `PORT` env).
- Tambahkan endpoint dasar:
  - `GET /` atau `GET /health` untuk healthcheck status server dan koneksi DB.
  - Endpoint contoh sederhana yang memanfaatkan Drizzle untuk membaca/menulis data ke MySQL.

### 5. Rekomendasi Struktur Direktori
```text
.
├── src/
│   ├── db/
│   │   ├── index.ts        # Inisialisasi koneksi Drizzle + MySQL
│   │   └── schema.ts       # Definisi schema database
│   ├── routes/             # Handler / rute Elysia (opsional jika modular)
│   └── index.ts            # Entrypoint Elysia server
├── drizzle.config.ts       # Konfigurasi Drizzle Kit
├── .env.example            # Template environment variables
├── package.json
└── tsconfig.json
```

---

## Kriteria Penyelesaian (Acceptance Criteria)
1. Project dapat dijalankan menggunakan perintah `bun run dev` (atau `bun run src/index.ts`) tanpa error.
2. Endpoint healthcheck mengembalikan response sukses saat diakses.
3. Konfigurasi Drizzle terhubung dengan MySQL dan script migrasi (`drizzle-kit`) dapat dijalankan.
4. Terdapat file `.env.example` yang jelas untuk kebutuhan konfigurasi database.
