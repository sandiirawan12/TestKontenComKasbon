# Kasbon

Web app buat catat hutang piutang pribadi — login, tambah catatan, tandai lunas, filter, cari, dan group per orang.

## Demo

**https://test-konten-com-kasbon.vercel.app/**

Buat akun baru di halaman signup, atau login kalau sudah punya.

## Setup

### 1. Clone & install

```bash
git clone <repo-url>
cd kasbon
npm install
```

### 2. Environment variables

Copy `.env.example` ke `.env.local`, lalu isi:

| Variable | Keterangan |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key dari Supabase |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` untuk dev lokal |

Credentials ada di Supabase → **Project Settings → API**. Pastikan **Authentication → Providers → Email** sudah enabled.

### 3. Migrate database

Buka **Supabase SQL Editor**, lalu jalankan seluruh isi file:

```
supabase/migrations/20250628000000_create_debts.sql
```

Migration ini membuat tabel `debts`, enum `debt_type`, trigger `updated_at`, dan RLS policy strict (`auth.uid() = user_id`) plus GRANT/REVOKE yang benar.

Alternatif kalau pakai Supabase CLI:

```bash
supabase db push
```

### 4. Jalankan lokal

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

> `npm run dev` memuat TLS fix untuk Windows/Node 22+. Kalau tidak perlu, bisa pakai `npm run dev:next`.

## Approach

Arsitektur **Next.js-only**: UI dan API (Route Handlers) dalam satu codebase yang deploy langsung ke Vercel, tanpa custom server. Business logic dipusatkan di `lib/services/debts.ts` dengan validasi Zod di boundary API — schema yang sama dipakai untuk query params dan request body, jadi error message konsisten antara client dan server. Keamanan data di-layer tiga: RLS Postgres (`auth.uid() = user_id`), explicit GRANT hanya ke role `authenticated` (bukan `anon`), dan filter `user_id` di setiap query service layer sebagai defense-in-depth. Status "lunas" disimpan sebagai `settled_at` timestamp di DB, bukan state UI semata, sehingga ringkasan saldo selalu dihitung dari data unsettled yang persisten.

## Trade-off (kalau ada 1 hari lagi)

- **Optimistic UI + toast** — aksi tandai lunas/hapus langsung terasa di UI, rollback kalau API gagal
- **E2E test Playwright** — regression flow auth, CRUD, dan verifikasi RLS tidak bocor
- **Polish UX** — skeleton loading, debounce search, konfirmasi hapus yang lebih baik dari `window.confirm`, dan responsive touch target di mobile
- **Pagination / infinite scroll** — saat ini semua data di-fetch sekaligus; belum scalable untuk ratusan entry

## Time Spent

~9 jam total, spread 2 hari (28–29 Jun 2026): ~5 jam core (scaffold, migration/RLS, API, UI dasar), ~4 jam debugging & polish (auth session di middleware, GRANT Supabase yang sempat block insert, TLS dev di Windows, refactor hapus Express, group-by-person, deploy Vercel).
