-- Fix: permission denied for table debts
-- Jalankan di Supabase SQL Editor jika migration awal sudah pernah di-run

GRANT USAGE ON TYPE public.debt_type TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.debts TO authenticated;
GRANT ALL ON TABLE public.debts TO service_role;
