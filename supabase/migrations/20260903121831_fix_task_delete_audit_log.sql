-- A deleted task no longer exists when the AFTER DELETE trigger writes its
-- audit event. Keep the deletion history without a task foreign-key value.
create or replace function private.audit_project_task_change()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  changed_task public.project_tasks;
  audit_action text;
begin
  changed_task := coalesce(new, old);
  audit_action := case tg_op
    when 'INSERT' then 'task_created'
    when 'DELETE' then 'task_deleted'
    else 'task_updated'
  end;

  insert into public.audit_logs (company_id, project_id, task_id, actor_id, action, detail)
  values (
    changed_task.company_id,
    changed_task.project_id,
    case when tg_op = 'DELETE' then null else changed_task.id end,
    (select auth.uid()),
    audit_action,
    jsonb_build_object(
      'title', changed_task.title,
      'status', changed_task.status,
      'progress', changed_task.progress
    )
  );

  perform private.recalculate_project_progress(changed_task.project_id);
  return coalesce(new, old);
end;
$$;

revoke all on function private.audit_project_task_change() from public;
