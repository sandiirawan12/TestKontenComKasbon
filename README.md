# Kasbon

Web app buat catat hutang piutang pribadi. Login, tambah catatan, tandai lunas, filter & cari.

**Demo:** https://test-konten-com-kasbon.vercel.app/

## Stack

- **Next.js 16** — UI + API routes
- **Supabase** — auth, PostgreSQL, RLS
- **Tailwind CSS v4** — styling
- **Zod** — validasi form & API

## Setup

```bash
git clone <repo-url>
cd kasbon
npm install
cp .env.example .env.local
# isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

### Database

Jalankan `supabase/migrations/20250628000000_create_debts.sql` di Supabase SQL Editor.

Tabel `debts` pakai RLS — user cuma bisa akses data miliknya sendiri (`auth.uid() = user_id`).

## Struktur folder

```
src/
├── app/                  # halaman & API routes
│   ├── api/debts/        # GET, POST, PATCH, DELETE
│   ├── login/
│   └── signup/
├── components/           # UI (Dashboard, form, list)
├── hooks/useDebts.ts     # fetch data dari API
├── lib/
│   ├── services/debts.ts # query ke Supabase
│   ├── supabase/         # client & auth server
│   ├── validation.ts     # schema Zod
│   └── format.ts         # format rupiah & tanggal
└── types/debt.ts         # tipe data Debt
```

## API

Semua endpoint butuh login (session cookie).

| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/debts` | List + ringkasan |
| POST | `/api/debts` | Tambah catatan |
| PATCH | `/api/debts/[id]` | Edit / tandai lunas |
| DELETE | `/api/debts/[id]` | Hapus |

Query: `status`, `type`, `search`, `sort`

## Deploy

Push ke GitHub → import di Vercel → set env vars → deploy.
