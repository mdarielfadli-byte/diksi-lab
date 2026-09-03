create table public.decision_logs (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null, decision text not null, owner_label text, impact text not null default '',
  status text not null default 'open' check (status in ('open','in_progress','completed')),
  client_visible boolean not null default true, created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.client_feedback (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  subject text not null, body text not null, status text not null default 'new' check (status in ('new','in_review','resolved')),
  coordinator_label text, created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index decision_logs_project_idx on public.decision_logs(project_id, created_at desc);
create index client_feedback_project_idx on public.client_feedback(project_id, status, created_at desc);
alter table public.decision_logs enable row level security;
alter table public.client_feedback enable row level security;
grant select, insert, update, delete on public.decision_logs, public.client_feedback to authenticated;
create policy "Members read visible decisions" on public.decision_logs for select to authenticated using (private.is_team_for_company(company_id) or (private.is_member_for_company(company_id) and client_visible));
create policy "Team manages decisions" on public.decision_logs for all to authenticated using (private.is_team_for_company(company_id)) with check (private.is_team_for_company(company_id));
create policy "Members read feedback" on public.client_feedback for select to authenticated using (private.is_member_for_company(company_id));
create policy "Clients add feedback" on public.client_feedback for insert to authenticated with check (private.is_member_for_company(company_id) and created_by = (select auth.uid()));
create policy "Team manages feedback" on public.client_feedback for update to authenticated using (private.is_team_for_company(company_id)) with check (private.is_team_for_company(company_id));
create or replace function private.notify_client_collaboration() returns trigger language plpgsql security definer set search_path = public, private as $$
begin
 if tg_table_name = 'client_feedback' and tg_op = 'INSERT' then
  insert into public.notifications (recipient_id,company_id,project_id,kind,title,body)
  select user_id,new.company_id,new.project_id,'feedback_added','Feedback klien baru',new.subject from public.company_memberships where company_id=new.company_id and role in ('admin','team') and user_id <> new.created_by;
 elsif tg_table_name = 'decision_logs' and new.client_visible then
  insert into public.notifications (recipient_id,company_id,project_id,kind,title,body)
  select user_id,new.company_id,new.project_id,'decision_added','Keputusan proyek diperbarui',new.title from public.company_memberships where company_id=new.company_id and role='client' and user_id <> coalesce((select auth.uid()),'00000000-0000-0000-0000-000000000000'::uuid);
 end if;
 return coalesce(new,old);
end; $$;
revoke all on function private.notify_client_collaboration() from public;
create trigger client_feedback_notify after insert on public.client_feedback for each row execute function private.notify_client_collaboration();
create trigger decision_logs_notify after insert or update on public.decision_logs for each row execute function private.notify_client_collaboration();
