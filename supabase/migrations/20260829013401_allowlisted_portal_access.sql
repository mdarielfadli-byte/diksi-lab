create table public.portal_access_allowlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company_id uuid not null references public.companies(id) on delete cascade,
  role text not null check (role in ('admin', 'team', 'client')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email, company_id)
);

alter table public.portal_access_allowlist enable row level security;

create policy "Super admins can manage portal allowlist"
on public.portal_access_allowlist for all to authenticated
using ((select private.is_super_admin()))
with check ((select private.is_super_admin()));

create or replace function private.assign_allowlisted_portal_access()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.company_memberships (company_id, user_id, role)
  select allowlist.company_id, new.id, allowlist.role
  from public.portal_access_allowlist allowlist
  where allowlist.is_active
    and lower(allowlist.email) = lower(new.email)
  on conflict (company_id, user_id) do update
    set role = excluded.role;

  return new;
end;
$$;

revoke all on function private.assign_allowlisted_portal_access() from public;

create trigger on_auth_user_created_assign_allowlisted_access
after insert on auth.users
for each row execute function private.assign_allowlisted_portal_access();

insert into public.portal_access_allowlist (email, company_id, role)
select 'muhammad.fadli@dayalima.id', company.id, 'client'
from public.companies company
where company.slug = 'dr-santi-story'
on conflict (email, company_id) do update
  set role = excluded.role,
      is_active = true,
      updated_at = now();
