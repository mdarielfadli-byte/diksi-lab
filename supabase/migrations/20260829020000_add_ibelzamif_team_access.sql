insert into public.portal_access_allowlist (email, company_id, role)
select 'ibelzamif@gmail.com', company.id, 'team'
from public.companies company
where company.slug = 'dr-santi-story'
on conflict (email, company_id) do update
  set role = excluded.role,
      is_active = true,
      updated_at = now();

update public.client_public_dashboards
set payload = jsonb_set(
  payload,
  '{planned_work,3}',
  jsonb_build_object(
    'area', 'Delivery',
    'date', '26 SEP',
    'owner', 'DiksiLab × bangunbrandmu',
    'status', 'Terjadwal',
    'activity', 'Produksi, QA, handover, dan rekomendasi Cycle 1',
    'scheduled_for', '2026-09-26'
  )
),
updated_at = now(),
updated_by = 'DiksiLab'
where slug = 'dr-santi-story';
