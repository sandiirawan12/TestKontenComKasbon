# Kasbon

Web app sederhana buat track utang piutang pribadi. Catat siapa hutang berapa ke kamu, atau sebaliknya — tandai lunas kalau udah dibayar.

**Demo:** _(isi link Vercel setelah deploy)_

## Stack

| Tech | Fungsi |
|------|--------|
| Next.js 16 (App Router) | Frontend + API route handlers |
| Tailwind CSS v4 | Styling |
| Supabase | PostgreSQL + Auth + RLS |
| Lucide React | Icons |
| Zod | Validasi client & server |
| date-fns | Format tanggal relative (`id` locale) |

**Library tambahan:**
- **Zod** — validasi schema terpusat, dipakai di API route handler dan form client
- **date-fns** — relative time Bahasa Indonesia ("3 hari lalu", "kemarin") via locale `id`

## Setup Lokal

### 1. Clone & install

```bash
git clone <repo-url>
cd kasbon
npm install
```

### 2. Supabase project

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** → jalankan isi file `supabase/migrations/20250628000000_create_debts.sql`
3. Di **Authentication → Providers**, pastikan Email enabled
4. Ambil credentials di **Project Settings → API**

### 3. Environment variables

Copy `.env.example` ke `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## API Endpoints

Semua endpoint wajib auth (session cookie Supabase atau `Authorization: Bearer <token>`).

| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/debts?status=&type=&search=&sort=` | List + summary |
| POST | `/api/debts` | Buat entry baru |
| PATCH | `/api/debts/[id]` | Update / tandai lunas |
| DELETE | `/api/debts/[id]` | Hapus entry |

Query params:
- `status`: `all` | `unsettled` | `settled`
- `type`: `all` | `owed_to_me` | `i_owe`
- `search`: cari nama (bonus)
- `sort`: `date_desc` | `date_asc` | `amount_desc` | `amount_asc`

## Database & RLS

Tabel `debts` dengan RLS strict — user cuma bisa CRUD row miliknya (`auth.uid() = user_id`).

**Test kebocoran RLS** (ganti URL & anon key kamu):

```bash
# Harus return [] atau 401 — BUKAN data user lain
curl "https://YOUR_PROJECT.supabase.co/rest/v1/debts" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Tanpa session user yang valid, RLS memblokir semua row.

## Deploy Vercel

1. Push repo ke GitHub
2. Import di [vercel.com](https://vercel.com)
3. Set env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy — API jalan via Next.js Route Handlers

## Approach

Arsitektur **thin API routes + shared service layer**: route handler Next.js (`app/api/debts/`) tipis, business logic di `lib/services/debts.ts`, validasi Zod terpusat. "Tandai lunas" persist ke DB via `settled_at` — bukan state client semata.

## Trade-off (kalau ada 1 hari lagi)

- **Group by orang** — misal "Budi: 3 entry, total Rp X" dengan expand/collapse
- **Optimistic UI** + toast feedback biar aksi terasa lebih snappy
- **E2E test** Playwright buat flow auth + CRUD + RLS regression
- Polish micro-interaction: skeleton loading, animasi modal, haptic feedback di mobile

## Time Spent

~6 jam (scaffold, DB/RLS, API, UI, README, deploy setup)

## Commit History

Proyek ini punya commit history bermakna — lihat `git log` untuk breakdown per feature.
