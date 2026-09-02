+create table public.project_meetings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  cycle_id uuid references public.cycles(id) on delete set null,
  title text not null check (char_length(trim(title)) between 2 and 180),
  meeting_at timestamptz not null,
  agenda text not null default '',
  discussion_points text not null default '',
  minutes_of_meeting text not null default '',
  status text not null default 'planned' check (status in ('planned', 'completed', 'cancelled')),
  client_visible boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete restrict,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.meeting_files (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.project_meetings(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 255),
  storage_path text not null unique,
  content_type text,
  byte_size bigint check (byte_size is null or byte_size >= 0),
  client_visible boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.meeting_action_items (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.project_meetings(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 500),
  owner_label text,
  due_on date,
  is_done boolean not null default false,
  client_visible boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index project_meetings_project_date_idx on public.project_meetings(project_id, meeting_at desc);
create index meeting_files_meeting_created_idx on public.meeting_files(meeting_id, created_at desc);
create index meeting_actions_meeting_due_idx on public.meeting_action_items(meeting_id, due_on);

grant select, insert, update, delete on public.project_meetings, public.meeting_files, public.meeting_action_items to authenticated;

alter table public.project_meetings enable row level security;
alter table public.meeting_files enable row level security;
alter table public.meeting_action_items enable row level security;

create policy "Members read visible project meetings"
on public.project_meetings for select to authenticated
using (
  private.is_team_for_company(company_id)
  or (private.is_member_for_company(company_id) and client_visible)
);

create policy "Team manages project meetings"
on public.project_meetings for all to authenticated
using (private.is_team_for_company(company_id))
with check (private.is_team_for_company(company_id));

create policy "Members read visible meeting files"
on public.meeting_files for select to authenticated
using (
  private.is_team_for_company(company_id)
  or (
    private.is_member_for_company(company_id)
    and client_visible
    and exists (
      select 1 from public.project_meetings meeting
      where meeting.id = meeting_files.meeting_id
        and meeting.company_id = meeting_files.company_id
        and meeting.client_visible
    )
  )
);

create policy "Team manages meeting files"
on public.meeting_files for all to authenticated
using (private.is_team_for_company(company_id))
with check (private.is_team_for_company(company_id));

create policy "Members read visible meeting action items"
on public.meeting_action_items for select to authenticated
using (
  private.is_team_for_company(company_id)
  or (
    private.is_member_for_company(company_id)
    and client_visible
    and exists (
      select 1 from public.project_meetings meeting
      where meeting.id = meeting_action_items.meeting_id
        and meeting.company_id = meeting_action_items.company_id
        and meeting.client_visible
    )
  )
);

create policy "Team manages meeting action items"
on public.meeting_action_items for all to authenticated
using (private.is_team_for_company(company_id))
with check (private.is_team_for_company(company_id));

create or replace function private.set_project_meeting_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.audit_project_meeting_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meeting_row public.project_meetings;
  audit_action text;
begin
  meeting_row := coalesce(new, old);
  audit_action := case tg_op
    when 'INSERT' then 'meeting_created'
    when 'DELETE' then 'meeting_deleted'
    else 'meeting_updated'
  end;
  insert into public.audit_logs (company_id, project_id, actor_id, action, detail)
  values (
    meeting_row.company_id,
    meeting_row.project_id,
    (select auth.uid()),
    audit_action,
    jsonb_build_object(
      'title', meeting_row.title,
      'status', meeting_row.status,
      'meeting_at', meeting_row.meeting_at
    )
  );
  return coalesce(new, old);
end;
$$;

revoke all on function private.set_project_meeting_updated_at() from public;
revoke all on function private.audit_project_meeting_change() from public;

create trigger project_meetings_set_updated_at
before update on public.project_meetings
for each row execute function private.set_project_meeting_updated_at();

create trigger project_meetings_audit
after insert or update or delete on public.project_meetings
for each row execute function private.audit_project_meeting_change();
