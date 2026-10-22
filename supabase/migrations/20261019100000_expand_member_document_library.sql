alter table public.documents
  alter column storage_path drop not null,
  add column external_url text;

alter table public.documents
  add constraint documents_storage_or_https_link
  check (
    (storage_path is not null and external_url is null)
    or (storage_path is null and external_url is not null and external_url ~* '^https://')
  );

drop policy if exists "Team can add documents" on public.documents;
create policy "Members can add company documents and links"
on public.documents for insert to authenticated
with check (
  private.is_member_for_company(company_id)
  and uploaded_by = (select auth.uid())
  and (project_id is null or exists (
    select 1 from public.projects p
    where p.id = documents.project_id and p.company_id = documents.company_id
  ))
  and (
    (storage_path is not null and external_url is null and storage_path like company_id::text || '/%')
    or (storage_path is null and external_url ~* '^https://')
  )
);

create policy "Super admins can read client documents storage"
on storage.objects for select to authenticated
using (bucket_id = 'client-documents' and private.is_super_admin());

create policy "Super admins can upload client documents storage"
on storage.objects for insert to authenticated
with check (bucket_id = 'client-documents' and private.is_super_admin());

create policy "Members can delete own uploaded client files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'client-documents'
  and owner_id = (select auth.uid())::text
  and exists (
    select 1 from public.company_memberships m
    where m.company_id::text = (storage.foldername(objects.name))[1]
      and m.user_id = (select auth.uid())
  )
);

create policy "Super admins can delete own client documents storage"
on storage.objects for delete to authenticated
using (bucket_id = 'client-documents' and private.is_super_admin() and owner_id = (select auth.uid())::text);
