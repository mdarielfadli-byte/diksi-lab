create schema if not exists private;

alter table public.profiles
  add column if not exists access_level text not null default 'member'
  check (access_level in ('super_admin', 'member'));

create or replace function private.is_super_admin()
returns boolean language sql security definer set search_path = '' stable as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and access_level = 'super_admin');
$$;

revoke all on function private.is_super_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_super_admin() to authenticated;

create policy "Users can view their profile" on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.is_super_admin()));
create policy "Super admins can manage profiles" on public.profiles for all to authenticated
using ((select private.is_super_admin())) with check ((select private.is_super_admin()));

create policy "Super admins can manage companies" on public.companies for all to authenticated
using ((select private.is_super_admin())) with check ((select private.is_super_admin()));
create policy "Super admins can manage memberships" on public.company_memberships for all to authenticated
using ((select private.is_super_admin())) with check ((select private.is_super_admin()));
create policy "Super admins can manage projects" on public.projects for all to authenticated
using ((select private.is_super_admin())) with check ((select private.is_super_admin()));
create policy "Super admins can manage cycles" on public.cycles for all to authenticated
using ((select private.is_super_admin())) with check ((select private.is_super_admin()));
create policy "Super admins can manage work items" on public.work_items for all to authenticated
using ((select private.is_super_admin())) with check ((select private.is_super_admin()));
create policy "Super admins can manage activities" on public.activities for all to authenticated
using ((select private.is_super_admin())) with check ((select private.is_super_admin()));
create policy "Super admins can manage ad spend" on public.ad_spend for all to authenticated
using ((select private.is_super_admin())) with check ((select private.is_super_admin()));
create policy "Super admins can manage documents" on public.documents for all to authenticated
using ((select private.is_super_admin())) with check ((select private.is_super_admin()));

drop policy if exists "Members can add documents" on public.documents;
create policy "Team can add documents" on public.documents for insert to authenticated with check (
  exists (select 1 from public.company_memberships m where m.company_id = documents.company_id and m.user_id = (select auth.uid()) and m.role in ('admin', 'team'))
  or (select private.is_super_admin())
);

update public.profiles p set access_level = 'super_admin'
from auth.users u where p.id = u.id and lower(u.email) = 'mdarielfadli@gmail.com';
