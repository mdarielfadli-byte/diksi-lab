create table public.client_public_dashboards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text not null default 'DiksiLab'
);

alter table public.client_public_dashboards enable row level security;

create policy "Super admins manage public dashboard snapshots" on public.client_public_dashboards for all to authenticated
using ((select private.is_super_admin())) with check ((select private.is_super_admin()));

create policy "Public reads Dr Santi dashboard snapshot" on public.client_public_dashboards for select to anon
using (slug = 'dr-santi-story');

insert into public.client_public_dashboards (slug, updated_by, payload)
values (
  'dr-santi-story',
  'DiksiLab',
  jsonb_build_object(
    'client_name', 'Dr. Santi Story',
    'project_name', 'Foundation & Digital Readiness',
    'cycle_name', 'Cycle 0',
    'cycle_start', '2026-08-29',
    'cycle_end', '2026-09-27',
    'project_status', 'Aktif',
    'progress', 0,
    'ads_spend', 0,
    'tracker_count', 10,
    'planned_work', jsonb_build_array(
      jsonb_build_object('date', '29 AGU', 'activity', 'Kickoff Cycle 0 & penguncian readiness', 'area', 'Governance', 'status', 'Terjadwal', 'owner', 'DiksiLab × bangunbrandmu × Dr. Santi Story'),
      jsonb_build_object('date', '2 — 4 SEP', 'activity', 'Audit baseline Instagram, LinkedIn, ads, positioning, dan audiens', 'area', 'Content & performance', 'status', 'Terjadwal', 'owner', 'DiksiLab'),
      jsonb_build_object('date', '8 — 15 SEP', 'activity', 'Website, CTA, SEO, dan funnel/CRM', 'area', 'Digital foundation', 'status', 'Terjadwal', 'owner', 'DiksiLab'),
      jsonb_build_object('date', '19 — 27 SEP', 'activity', 'Produksi, QA, handover, dan rekomendasi Cycle 1', 'area', 'Delivery', 'status', 'Terjadwal', 'owner', 'DiksiLab × bangunbrandmu')
    ),
    'completed_work', jsonb_build_array(
      jsonb_build_object('date', '28 AGU', 'activity', 'Project Dr. Santi Story, Cycle 0, dan 10 item pekerjaan dibuat di tracker Diksilab.', 'area', 'Setup project', 'status', 'Selesai', 'owner', 'DiksiLab'),
      jsonb_build_object('date', '28 AGU', 'activity', 'Proposal kemitraan dan Cycle 0 execution pack ditinjau sebagai dasar pelaksanaan.', 'area', 'Dokumen kerja', 'status', 'Selesai', 'owner', 'DiksiLab'),
      jsonb_build_object('date', '28 AGU', 'activity', 'Dashboard read-only untuk cycle, progres, jadwal, dan pengeluaran ads diterbitkan.', 'area', 'Dashboard klien', 'status', 'Selesai', 'owner', 'DiksiLab')
    ),
    'updates', jsonb_build_array(
      jsonb_build_object('title', 'Readiness kickoff', 'detail', 'Konfirmasi PIC, akses minimum, dan questionnaire desain sebelum sesi kickoff.', 'status', 'needs_approval', 'owner', 'Dr. Santi Story', 'due', '29 AGU'),
      jsonb_build_object('title', 'Tracker Cycle 0 aktif', 'detail', 'Timeline, owner, status, dan dependensi awal telah disusun untuk Cycle 0.', 'status', 'approved', 'owner', 'DiksiLab', 'due', '28 AGU'),
      jsonb_build_object('title', 'Baseline measurement', 'detail', 'Audit konten dan paid media akan menetapkan baseline sebelum KPI dinilai.', 'status', 'info', 'owner', 'DiksiLab', 'due', '4 SEP')
    ),
    'metrics', jsonb_build_array(
      jsonb_build_object('name', 'Baseline konten', 'group', 'Content', 'value', null, 'unit', 'post', 'status', 'baseline_pending'),
      jsonb_build_object('name', 'Engagement rate', 'group', 'Content', 'value', null, 'unit', '%', 'status', 'baseline_pending'),
      jsonb_build_object('name', 'Organic visibility', 'group', 'SEO', 'value', null, 'unit', 'index', 'status', 'baseline_pending'),
      jsonb_build_object('name', 'Amount spent', 'group', 'Ads', 'value', 0, 'unit', 'IDR', 'status', 'on_track')
    ),
    'documents', jsonb_build_array(
      jsonb_build_object('title', 'Proposal Kemitraan Strategis', 'type', 'Proposal', 'version', 'v2', 'status', 'Disimpan privat', 'updated', '26 JUL 2026'),
      jsonb_build_object('title', 'Cycle 0 Pre-read & Kickoff Execution Pack', 'type', 'Execution pack', 'version', 'Cycle 0', 'status', 'Disimpan privat', 'updated', '28 AGU 2026')
    )
  )
);
