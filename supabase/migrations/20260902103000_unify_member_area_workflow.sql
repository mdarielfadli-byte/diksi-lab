alter table public.project_tasks
  add column if not exists owner_label text,
  add column if not exists blocked_reason text;

create table if not exists public.cycle_reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  cycle_id uuid not null references public.cycles(id) on delete cascade,
  summary text not null default '',
  completed_summary text not null default '',
  blockers text not null default '',
  next_focus text not null default '',
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (cycle_id)
);

create index if not exists cycle_reports_project_idx on public.cycle_reports(project_id, updated_at desc);

alter table public.cycle_reports enable row level security;

create policy "Members read cycle reports"
on public.cycle_reports for select to authenticated
using (private.is_member_for_company(company_id));

create policy "Team manages cycle reports"
on public.cycle_reports for all to authenticated
using (private.is_team_for_company(company_id))
with check (private.is_team_for_company(company_id));

create policy "Members read company documents"
on public.documents for select to authenticated
using (private.is_member_for_company(company_id));

insert into public.cycle_reports (company_id, project_id, cycle_id, summary, completed_summary, blockers, next_focus)
select project.company_id, cycle.project_id, cycle.id,
  coalesce(cycle.summary, 'Menyatukan fondasi strategi, website, CRM, measurement, dan kesiapan produksi.'),
  'Kickoff, struktur proyek, tracker, dan materi Cycle 0 telah disiapkan.',
  'Domain, aset visual, akses operasional, dan final approver masih perlu dikonfirmasi.',
  'Kunci input klien, lanjutkan revisi website, lalu siapkan CRM dan measurement.'
from public.cycles cycle
join public.projects project on project.id = cycle.project_id
on conflict (cycle_id) do nothing;

create or replace function private.notify_workspace_event()
returns trigger language plpgsql security definer set search_path = '' as $$
declare task_row public.project_tasks;
begin
  if tg_table_name = 'project_tasks' then
    if tg_op = 'INSERT' and new.owner_id is not null and new.owner_id <> (select auth.uid()) then
      insert into public.notifications (recipient_id, company_id, project_id, task_id, kind, title, body)
      values (new.owner_id, new.company_id, new.project_id, new.id, 'task_assigned', 'Task baru ditugaskan', new.title);
    elsif tg_op = 'UPDATE' and new.owner_id is not null and new.owner_id <> (select auth.uid())
      and (new.status is distinct from old.status or new.due_on is distinct from old.due_on) then
      insert into public.notifications (recipient_id, company_id, project_id, task_id, kind, title, body)
      values (new.owner_id, new.company_id, new.project_id, new.id, 'task_updated', 'Task diperbarui', new.title || ' · ' || replace(new.status, '_', ' '));
    end if;
    return new;
  end if;

  if tg_table_name = 'task_approvals' then
    select * into task_row from public.project_tasks where id = coalesce(new.task_id, old.task_id);
    if tg_op = 'INSERT' then
      insert into public.notifications (recipient_id, company_id, project_id, task_id, kind, title, body)
      select membership.user_id, task_row.company_id, task_row.project_id, task_row.id, 'approval_requested', 'Approval diperlukan', task_row.title
      from public.company_memberships membership
      where membership.company_id = task_row.company_id and membership.role = 'client'
        and membership.user_id <> coalesce((select auth.uid()), '00000000-0000-0000-0000-000000000000'::uuid);
    elsif new.status <> 'pending' then
      insert into public.notifications (recipient_id, company_id, project_id, task_id, kind, title, body)
      select membership.user_id, task_row.company_id, task_row.project_id, task_row.id, 'approval_decided', 'Keputusan klien diterima', task_row.title || ' · ' || replace(new.status, '_', ' ')
      from public.company_memberships membership
      where membership.company_id = task_row.company_id and membership.role in ('admin', 'team')
        and membership.user_id <> coalesce((select auth.uid()), '00000000-0000-0000-0000-000000000000'::uuid);
    end if;
    return new;
  end if;

  if tg_table_name = 'task_files' and new.client_visible then
    insert into public.notifications (recipient_id, company_id, project_id, task_id, kind, title, body)
    select membership.user_id, new.company_id, new.project_id, new.task_id, 'file_added', 'File baru tersedia', new.name
    from public.company_memberships membership
    where membership.company_id = new.company_id and membership.role = 'client'
      and membership.user_id <> coalesce((select auth.uid()), '00000000-0000-0000-0000-000000000000'::uuid);
    return new;
  end if;

  if tg_table_name = 'task_comments' and new.visibility = 'client' then
    select * into task_row from public.project_tasks where id = new.task_id;
    insert into public.notifications (recipient_id, company_id, project_id, task_id, kind, title, body)
    select membership.user_id, new.company_id, task_row.project_id, new.task_id, 'comment_added', 'Komentar baru pada task', task_row.title
    from public.company_memberships membership
    where membership.company_id = new.company_id and membership.user_id <> new.author_id
      and ((private.is_team_for_company(new.company_id) and membership.role = 'client')
        or (not private.is_team_for_company(new.company_id) and membership.role in ('admin', 'team')));
    return new;
  end if;
  return coalesce(new, old);
end;
$$;

revoke all on function private.notify_workspace_event() from public;

drop trigger if exists project_tasks_notify_workspace on public.project_tasks;
create trigger project_tasks_notify_workspace after insert or update on public.project_tasks
for each row execute function private.notify_workspace_event();
drop trigger if exists task_approvals_notify_workspace on public.task_approvals;
create trigger task_approvals_notify_workspace after insert or update on public.task_approvals
for each row execute function private.notify_workspace_event();
drop trigger if exists task_files_notify_workspace on public.task_files;
create trigger task_files_notify_workspace after insert on public.task_files
for each row execute function private.notify_workspace_event();
drop trigger if exists task_comments_notify_workspace on public.task_comments;
create trigger task_comments_notify_workspace after insert on public.task_comments
for each row execute function private.notify_workspace_event();
