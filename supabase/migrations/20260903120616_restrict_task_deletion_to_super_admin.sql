-- Task deletion is intentionally stricter than task editing: only the account
-- designated as Super Admin may remove a task and its dependent records.
drop policy if exists "Team deletes project tasks" on public.project_tasks;
create policy "Super admin deletes project tasks"
on public.project_tasks
for delete
to authenticated
using ((select private.is_super_admin()));
