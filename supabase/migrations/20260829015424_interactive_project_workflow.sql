create table public.task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.project_tasks(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  label text not null check (char_length(trim(label)) between 1 and 280),
  is_done boolean not null default false,
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_dependencies (
  task_id uuid not null references public.project_tasks(id) on delete cascade,
  depends_on_task_id uuid not null references public.project_tasks(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, depends_on_task_id),
  check (task_id <> depends_on_task_id)
);

create index task_checklist_items_task_position_idx on public.task_checklist_items(task_id, position);
create index task_dependencies_task_idx on public.task_dependencies(task_id);

alter table public.task_checklist_items enable row level security;
alter table public.task_dependencies enable row level security;

create policy "Members read visible task checklists" on public.task_checklist_items for select to authenticated
using (
  private.is_team_for_company(company_id)
  or exists (
    select 1 from public.project_tasks task
    where task.id = task_checklist_items.task_id
      and task.company_id = task_checklist_items.company_id
      and task.client_visible
      and private.is_member_for_company(task.company_id)
  )
);
create policy "Team manages task checklists" on public.task_checklist_items for all to authenticated
using (private.is_team_for_company(company_id))
with check (private.is_team_for_company(company_id));

create policy "Members read visible task dependencies" on public.task_dependencies for select to authenticated
using (
  private.is_team_for_company(company_id)
  or exists (
    select 1 from public.project_tasks task
    where task.id = task_dependencies.task_id
      and task.company_id = task_dependencies.company_id
      and task.client_visible
      and private.is_member_for_company(task.company_id)
  )
);
create policy "Team manages task dependencies" on public.task_dependencies for all to authenticated
using (private.is_team_for_company(company_id))
with check (private.is_team_for_company(company_id));

create or replace function private.audit_interactive_workspace_change()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  record_data record;
  action_name text;
begin
  record_data := coalesce(new, old);
  action_name := case tg_table_name
    when 'task_comments' then 'comment_added'
    when 'task_approvals' then case when tg_op = 'INSERT' then 'approval_requested' else 'approval_decided' end
    when 'task_files' then 'file_added'
    when 'task_checklist_items' then 'checklist_updated'
    when 'task_dependencies' then 'dependency_updated'
    else 'workspace_updated'
  end;

  insert into public.audit_logs (company_id, project_id, task_id, actor_id, action, detail)
  select record_data.company_id, task.project_id, record_data.task_id, (select auth.uid()), action_name,
    jsonb_build_object('table', tg_table_name, 'operation', tg_op)
  from public.project_tasks task
  where task.id = record_data.task_id;

  return coalesce(new, old);
end;
$$;

revoke all on function private.audit_interactive_workspace_change() from public;

create trigger task_comments_audit_and_notify
after insert on public.task_comments
for each row execute function private.audit_interactive_workspace_change();
create trigger task_approvals_audit
after insert or update on public.task_approvals
for each row execute function private.audit_interactive_workspace_change();
create trigger task_files_audit
after insert on public.task_files
for each row execute function private.audit_interactive_workspace_change();
create trigger task_checklists_audit
after insert or update or delete on public.task_checklist_items
for each row execute function private.audit_interactive_workspace_change();
create trigger task_dependencies_audit
after insert or delete on public.task_dependencies
for each row execute function private.audit_interactive_workspace_change();
