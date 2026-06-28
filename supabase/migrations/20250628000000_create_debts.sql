-- Kasbon: tabel debts + RLS strict per user
-- Jalankan di Supabase SQL Editor atau via supabase db push

CREATE TYPE debt_type AS ENUM ('owed_to_me', 'i_owe');

CREATE TABLE public.debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type debt_type NOT NULL,
  counterpart_name TEXT NOT NULL CHECK (char_length(trim(counterpart_name)) > 0),
  amount BIGINT NOT NULL CHECK (amount > 0),
  note TEXT CHECK (note IS NULL OR char_length(note) <= 200),
  due_date DATE,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX debts_user_id_idx ON public.debts (user_id);
CREATE INDEX debts_user_status_idx ON public.debts (user_id, settled_at);
CREATE INDEX debts_user_type_idx ON public.debts (user_id, type);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- RLS: user cuma bisa akses row miliknya sendiri
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "debts_select_own"
  ON public.debts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "debts_insert_own"
  ON public.debts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "debts_update_own"
  ON public.debts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "debts_delete_own"
  ON public.debts FOR DELETE
  USING (auth.uid() = user_id);
