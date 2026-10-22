alter table public.documents
  add column if not exists pic text,
  add column if not exists objective text,
  add column if not exists cycle_label text,
  add column if not exists notes text;
