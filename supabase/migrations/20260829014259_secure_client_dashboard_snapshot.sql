create policy "Members can read their company dashboard snapshot"
on public.client_public_dashboards for select to authenticated
using (
  (select private.is_super_admin())
  or exists (
    select 1
    from public.companies company
    join public.company_memberships membership on membership.company_id = company.id
    where company.slug = client_public_dashboards.slug
      and membership.user_id = (select auth.uid())
  )
);
