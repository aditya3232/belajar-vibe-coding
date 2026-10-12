# Task: Implementasi Sistem Autentikasi (JWT + Bcrypt), Proteksi Route, Standarisasi Response, dan Dokumentasi Swagger UI

## 1. Ringkasan Fitur
Menambahkan sistem autentikasi pengguna pada project backend ElysiaJS yang sudah ada. Fitur ini mencakup migrasi skema tabel `users` untuk menyimpan hash password, pembuatan endpoint auth (`register`, `login`, `logout`), integrasi token JWT, proteksi route `/users/*`, penerapan standarisasi format response & error, serta integrasi Swagger UI untuk dokumentasi API interaktif.

---

## 2. Dependensi Tambahan
Untuk mendukung fitur auth dan dokumentasi pada ElysiaJS, pasang package resmi berikut:
- **`@elysiajs/swagger`**: Plugin Swagger / OpenAPI untuk dokumentasi otomatis.
- **`@elysiajs/jwt`**: Plugin manajemen sign & verify token JWT di Elysia.
- **Password Hashing**: Gunakan `Bun.password` (bawaan Bun dengan algoritma bcrypt: `Bun.password.hash(..., { algorithm: "bcrypt" })`) atau library `bcryptjs`.

---

## 3. Desain Database & Skema Drizzle

Perbarui definisi tabel `users` pada `src/db/schema.ts`:

| Kolom | Tipe Data | Atribut / Keterangan |
|---|---|---|
| `id` | Integer / Serial | Primary Key, Auto Increment |
| `name` | Varchar(255) | Not Null |
| `email` | Varchar(255) | Not Null, Unique |
| `password` | Varchar(255) | Not Null (Menyimpan hash bcrypt, jangan simpan plaintext) |
| `created_at` | Timestamp | Not Null, Default `CURRENT_TIMESTAMP` |
| `updated_at` | Timestamp | Not Null, Default `CURRENT_TIMESTAMP`, On Update `CURRENT_TIMESTAMP` |

> **Catatan**: Setelah schema diupdate, jalankan `bun run db:generate` dan `bun run db:push` (atau `db:migrate`).

---

## 4. Standarisasi Format Request & Response API

Semua endpoint harus mengikuti pola respons yang konsisten agar mudah dikonsumsi oleh client.

### A. Response Sukses
Gunakan format seragam dengan status code HTTP yang sesuai (200 OK, 201 Created):
```json
{
  "success": true,
  "message": "Deskripsi singkat hasil operasi",
  "data": { ... } // Objek data atau array (opsional jika tidak ada data)
}
```

### B. Response Gagal / Error
Gunakan status code HTTP yang presisi (400 Bad Request, 401 Unauthorized, 404 Not Found, 409 Conflict, 500 Internal Server Error):
```json
{
  "success": false,
  "message": "Pesan error yang informatif dan ramah pengguna",
  "errors": null // Detail error validasi / field errors jika ada
}
```

### C. Validasi Schema
- Manfaatkan skema validasi Elysia (`t.Object(...)`) untuk memvalidasi `body`, `params`, dan `headers`.
- Pastikan field rahasia seperti `password` **tidak pernah dikembalikan** pada response body (sanitize data sebelum di-return).

---

## 5. Spesifikasi Endpoint

### A. Modul Autentikasi (`/auth/*`)
Kelompokkan rute auth ke dalam `src/routes/auth.ts`:

1. **`POST /auth/register`**
   - **Tujuan**: Mendaftarkan pengguna baru ke sistem.
   - **Request Body**:
     - `name`: string (min length: 2)
     - `email`: string (format email valid)
     - `password`: string (min length: 6)
   - **Logika**:
     - Validasi keunikan email (return 409 jika email sudah terdaftar).
     - Hash password menggunakan bcrypt.
     - Simpan user ke database.
     - Generate token JWT untuk user yang baru terdaftar.
   - **Response**: `201 Created` dengan info user (tanpa password) dan token JWT.

2. **`POST /auth/login`**
   - **Tujuan**: Autentikasi kredensial pengguna.
   - **Request Body**:
     - `email`: string (format email)
     - `password`: string
   - **Logika**:
     - Cari user berdasarkan email (return 401 jika tidak ditemukan).
     - Verifikasi password dengan hash bcrypt (return 401 jika password salah).
     - Generate token JWT yang berisi payload identitas user (`id`, `email`).
   - **Response**: `200 OK` dengan token JWT dan profil singkat user.

3. **`POST /auth/logout`**
   - **Tujuan**: Mengakhiri sesi pengguna.
   - **Logika**:
     - Endpoint penanda logout (dapat menginstruksikan client untuk menghapus token di local storage / cookie).
   - **Response**: `200 OK` dengan pesan konfirmasi logout berhasil.

---

### B. Proteksi Route Pengguna (`/users/*`)
- Pasang middleware / guard autentikasi pada grup route `src/routes/users.ts`.
- Request ke semua sub-route `/users/*` (list, detail, delete) **wajib menyertakan header**:
  `Authorization: Bearer <token_jwt>`
- Jika token tidak valid, kadaluarsa, atau header tidak ada, kembalikan respons:
  - Status: `401 Unauthorized`
  - Body: `{ "success": false, "message": "Unauthorized: Token tidak valid atau tidak disediakan" }`

---

### C. Dokumentasi Swagger UI
- Konfigurasi plugin `@elysiajs/swagger` di `src/index.ts`.
- Dokumentasi API harus dapat diakses melalui browser di route `/swagger`.
- Cantumkan konfigurasi Security Scheme (Bearer Auth) di Swagger agar programmer dapat melakukan test request pada route yang terproteksi langsung dari Swagger UI.

---

## 6. Tahapan Eksekusi untuk Implementer (Step-by-Step)

### Tahap 1: Instalasi & Konfigurasi Plugin
1. Install plugin `@elysiajs/swagger` dan `@elysiajs/jwt`.
2. Siapkan secret key JWT di file `.env` (misal: `JWT_SECRET=supersecretkey`) dan tambahkan ke `.env.example`.

### Tahap 2: Update Database Schema
1. Tambahkan kolom `password` pada skema `users` di `src/db/schema.ts`.
2. Pastikan timestamp `created_at` dan `updated_at` sesuai spesifikasi.
3. Jalankan migrasi atau sync skema ke database (`bun run db:push`).

### Tahap 3: Implementasi Helper & Format Response
1. Buat helper standar response sukses dan error agar reusable di seluruh route.
2. Siapkan konfigurasi JWT plugin dengan secret key dari env.

### Tahap 4: Pembuatan Modul Auth (`src/routes/auth.ts`)
1. Buat route `POST /auth/register` dengan validasi input, hashing password bcrypt, dan pembuatan JWT.
2. Buat route `POST /auth/login` dengan validasi kredensial dan pembuatan JWT.
3. Buat route `POST /auth/logout`.
4. Register rute auth ke server utama di `src/index.ts`.

### Tahap 5: Proteksi Route `/users`
1. Terapkan guard/middleware verifikasi JWT pada `src/routes/users.ts`.
2. Sesuaikan return value CRUD users agar menggunakan format response terstandarisasi.
3. Pastikan kolom `password` tidak ikut terekspos saat mengambil data user.

### Tahap 6: Integrasi Swagger UI
1. Pasang plugin swagger pada aplikasi Elysia di `src/index.ts` dengan path `/swagger`.
2. Konfigurasikan deskripsi API, tags, dan Bearer authentication.

### Tahap 7: Pengujian & Validasi
1. Akses `http://localhost:3000/swagger` dan verifikasi seluruh dokumentasi endpoint tampil.
2. Uji alur register -> login -> ambil token.
3. Akses `GET /users` tanpa token (harus gagal 401).
4. Akses `GET /users` dengan Bearer token (harus sukses 200).

---

## 7. Kriteria Penerimaan (Acceptance Criteria)
- [ ] Skema database `users` memiliki kolom `password` (hash) dan timestamps.
- [ ] Endpoint `/auth/register` sukses membuat user dan mengembalikan token JWT.
- [ ] Endpoint `/auth/login` memverifikasi password dan mengembalikan token JWT.
- [ ] Endpoint `/auth/logout` merespons sukses 200.
- [ ] Semua respons endpoint konsisten menggunakan format `{ success, message, data }`.
- [ ] Route `/users/*` menolak request tanpa token valid dengan status 401.
- [ ] Route `/users/*` menerima request dengan Bearer token yang valid.
- [ ] Password hash tidak pernah terekspos dalam respons API manapun.
- [ ] Dokumentasi Swagger UI aktif dan dapat diakses di `/swagger`.
