-- Secure, role-based collaboration workspace. Google identities start as members;
-- only the designated owner receives super-admin access automatically.
create table public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  cycle_id uuid references public.cycles(id) on delete set null,
  source_work_item_id uuid references public.work_items(id) on delete set null,
  title text not null check (char_length(trim(title)) between 2 and 180),
  description text,
  workstream text not null default 'general' check (workstream in ('website','landing_page','seo','crm','email_marketing','ads','content','general')),
  status text not null default 'planned' check (status in ('planned','in_progress','needs_review','blocked','approved','completed')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  progress smallint not null default 0 check (progress between 0 and 100),
  owner_id uuid references public.profiles(id) on delete set null,
  due_on date,
  client_visible boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.project_tasks(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  visibility text not null default 'team' check (visibility in ('team','client')),
  created_at timestamptz not null default now()
);

create table public.task_approvals (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.project_tasks(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','revision_requested')),
  request_note text,
  response_note text,
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index task_approvals_one_pending_per_task on public.task_approvals(task_id) where status = 'pending';

create table public.task_files (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.project_tasks(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 255),
  storage_path text not null unique,
  content_type text,
  byte_size bigint check (byte_size is null or byte_size >= 0),
  version_label text not null default 'v1',
  review_status text not null default 'draft' check (review_status in ('draft','needs_review','approved','final')),
  client_visible boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  task_id uuid references public.project_tasks(id) on delete cascade,
  kind text not null check (kind in ('task_assigned','task_updated','approval_requested','approval_decided','file_added','comment_added')),
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  task_id uuid references public.project_tasks(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index project_tasks_project_due_idx on public.project_tasks(project_id, due_on);
create index project_tasks_company_status_idx on public.project_tasks(company_id, status);
create index task_comments_task_created_idx on public.task_comments(task_id, created_at);
create index notifications_recipient_unread_idx on public.notifications(recipient_id, read_at, created_at desc);
create index audit_logs_project_created_idx on public.audit_logs(project_id, created_at desc);

alter table public.project_tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_approvals enable row level security;
alter table public.task_files enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create or replace function private.is_team_for_company(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select private.is_super_admin()
  or exists (
    select 1 from public.company_memberships membership
    where membership.company_id = target_company_id
      and membership.user_id = (select auth.uid())
      and membership.role in ('admin', 'team')
  );
$$;

create or replace function private.is_member_for_company(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select private.is_super_admin()
  or exists (
    select 1 from public.company_memberships membership
    where membership.company_id = target_company_id
      and membership.user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_team_for_company(uuid) from public;
revoke all on function private.is_member_for_company(uuid) from public;
grant execute on function private.is_team_for_company(uuid), private.is_member_for_company(uuid) to authenticated;

create or replace function private.handle_new_workspace_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, private
as $$
begin
  insert into public.profiles (id, full_name, access_level)
  values (
    new.id,
    nullif(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), ''),
    case when lower(new.email) = 'mdarielfadli@gmail.com' then 'super_admin' else 'member' end
  )
  on conflict (id) do update
  set full_name = coalesce(public.profiles.full_name, excluded.full_name),
      access_level = case when lower(new.email) = 'mdarielfadli@gmail.com' then 'super_admin' else public.profiles.access_level end;
  return new;
end;
$$;

revoke all on function private.handle_new_workspace_user() from public;
drop trigger if exists on_auth_user_created_workspace_profile on auth.users;
create trigger on_auth_user_created_workspace_profile
after insert on auth.users
for each row execute procedure private.handle_new_workspace_user();

-- Ensure the current owner remains the sole automatically elevated account.
update public.profiles profile
set access_level = 'super_admin'
from auth.users auth_user
where profile.id = auth_user.id and lower(auth_user.email) = 'mdarielfadli@gmail.com';

create or replace function private.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if new.access_level is distinct from old.access_level and not private.is_super_admin() then
    raise exception 'Only a super admin can change access level';
  end if;
  return new;
end;
$$;

revoke all on function private.prevent_profile_privilege_escalation() from public;
drop trigger if exists profiles_prevent_privilege_escalation on public.profiles;
create trigger profiles_prevent_privilege_escalation
before update on public.profiles
for each row execute procedure private.prevent_profile_privilege_escalation();

create or replace function private.recalculate_project_progress(target_project_id uuid)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  task_total integer;
  task_completed integer;
begin
  select count(*), count(*) filter (where status in ('approved', 'completed'))
  into task_total, task_completed
  from public.project_tasks
  where project_id = target_project_id;
  if task_total > 0 then
    update public.projects
    set progress = round((task_completed::numeric / task_total::numeric) * 100)::smallint
    where id = target_project_id;
  end if;
end;
$$;

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
  audit_action := case tg_op when 'INSERT' then 'task_created' when 'DELETE' then 'task_deleted' else 'task_updated' end;
  insert into public.audit_logs (company_id, project_id, task_id, actor_id, action, detail)
  values (
    changed_task.company_id, changed_task.project_id, changed_task.id, (select auth.uid()), audit_action,
    jsonb_build_object('title', changed_task.title, 'status', changed_task.status, 'progress', changed_task.progress)
  );
  perform private.recalculate_project_progress(changed_task.project_id);
  return coalesce(new, old);
end;
$$;

revoke all on function private.recalculate_project_progress(uuid) from public;
revoke all on function private.audit_project_task_change() from public;
drop trigger if exists project_tasks_audit_and_progress on public.project_tasks;
create trigger project_tasks_audit_and_progress
after insert or update or delete on public.project_tasks
for each row execute procedure private.audit_project_task_change();

create policy "Members read visible project tasks" on public.project_tasks for select to authenticated
using (
  private.is_team_for_company(company_id)
  or (private.is_member_for_company(company_id) and client_visible)
);
create policy "Team creates project tasks" on public.project_tasks for insert to authenticated
with check (private.is_team_for_company(company_id) and created_by = (select auth.uid()));
create policy "Team updates project tasks" on public.project_tasks for update to authenticated
using (private.is_team_for_company(company_id))
with check (private.is_team_for_company(company_id));
create policy "Team deletes project tasks" on public.project_tasks for delete to authenticated
using (private.is_team_for_company(company_id));

create policy "Members read allowed task comments" on public.task_comments for select to authenticated
using (private.is_team_for_company(company_id) or (private.is_member_for_company(company_id) and visibility = 'client'));
create policy "Team adds task comments" on public.task_comments for insert to authenticated
with check (private.is_team_for_company(company_id) and author_id = (select auth.uid()));
create policy "Clients add client-visible comments" on public.task_comments for insert to authenticated
with check (private.is_member_for_company(company_id) and author_id = (select auth.uid()) and visibility = 'client');

create policy "Members read task approvals" on public.task_approvals for select to authenticated
using (private.is_member_for_company(company_id));
create policy "Team requests approvals" on public.task_approvals for insert to authenticated
with check (private.is_team_for_company(company_id) and requested_by = (select auth.uid()));
create policy "Client or team decides approvals" on public.task_approvals for update to authenticated
using (private.is_member_for_company(company_id) and status = 'pending')
with check (private.is_member_for_company(company_id) and decided_by = (select auth.uid()) and status in ('approved', 'revision_requested'));

create policy "Members read visible task files" on public.task_files for select to authenticated
using (private.is_team_for_company(company_id) or (private.is_member_for_company(company_id) and client_visible));
create policy "Team creates task files" on public.task_files for insert to authenticated
with check (private.is_team_for_company(company_id) and uploaded_by = (select auth.uid()));
create policy "Team updates task files" on public.task_files for update to authenticated
using (private.is_team_for_company(company_id))
with check (private.is_team_for_company(company_id));
create policy "Team deletes task files" on public.task_files for delete to authenticated
using (private.is_team_for_company(company_id));

create policy "Users read their notifications" on public.notifications for select to authenticated
using (recipient_id = (select auth.uid()));
create policy "Users mark their notifications read" on public.notifications for update to authenticated
using (recipient_id = (select auth.uid()))
with check (recipient_id = (select auth.uid()));
create policy "Team sends company notifications" on public.notifications for insert to authenticated
with check (private.is_team_for_company(company_id));

create policy "Members read company audit trail" on public.audit_logs for select to authenticated
using (private.is_member_for_company(company_id));

-- Existing public snapshot is no longer exposed anonymously once member sign-in is enabled.
drop policy if exists "Public reads Dr Santi dashboard snapshot" on public.client_public_dashboards;
create policy "Members read their dashboard snapshot" on public.client_public_dashboards for select to authenticated
using (
  (slug = 'dr-santi-story' and private.is_member_for_company('1b19dc0e-dcb4-4781-b005-7d8196a2ad8b'::uuid))
  or private.is_super_admin()
);

-- Seed workspace tasks from already scheduled project work so the initial dashboard stays useful.
insert into public.project_tasks (company_id, project_id, cycle_id, source_work_item_id, title, workstream, status, priority, progress, due_on, client_visible, created_by)
select
  project.company_id,
  item.project_id,
  item.cycle_id,
  item.id,
  item.title,
  case lower(item.channel)
    when 'article seo' then 'seo'
    when 'instagram' then 'content'
    when 'linkedin' then 'content'
    when 'ads' then 'ads'
    else 'general'
  end,
  case
    when lower(item.status) in ('done', 'completed') then 'completed'
    when lower(item.status) in ('review', 'ready_for_review') then 'needs_review'
    when lower(item.status) in ('in progress', 'in_progress') then 'in_progress'
    else 'planned'
  end,
  'normal',
  case when lower(item.status) in ('done', 'completed') then 100 else 0 end,
  item.scheduled_for,
  true,
  (select id from public.profiles where access_level = 'super_admin' order by created_at limit 1)
from public.work_items item
join public.projects project on project.id = item.project_id
where not exists (select 1 from public.project_tasks task where task.source_work_item_id = item.id);
