create extension if not exists pgcrypto;

create schema if not exists private;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (organization_id, profile_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_by uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, id),
  unique (organization_id, slug),
  foreign key (organization_id, created_by)
    references public.organization_members(organization_id, profile_id)
);

create table public.issues (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null,
  reporter_id uuid not null,
  assignee_id uuid,
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '',
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'critical')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, id),
  foreign key (organization_id, project_id)
    references public.projects(organization_id, id),
  foreign key (organization_id, reporter_id)
    references public.organization_members(organization_id, profile_id),
  foreign key (organization_id, assignee_id)
    references public.organization_members(organization_id, profile_id)
);

create table public.issue_comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  issue_id uuid not null,
  author_id uuid not null,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (organization_id, issue_id)
    references public.issues(organization_id, id) on delete cascade,
  foreign key (organization_id, author_id)
    references public.organization_members(organization_id, profile_id)
);

comment on column public.organization_members.role is
  'Allowed values: owner or member.';
comment on column public.issues.status is
  'Allowed values: open, in_progress, resolved, or closed.';
comment on column public.issues.priority is
  'Allowed values: low, medium, high, or critical.';

create index organization_members_profile_id_idx
  on public.organization_members(profile_id);
create index projects_organization_id_idx
  on public.projects(organization_id);
create index issues_organization_status_idx
  on public.issues(organization_id, status);
create index issues_project_id_idx
  on public.issues(project_id);
create index issues_assignee_id_idx
  on public.issues(assignee_id);
create index issue_comments_issue_id_idx
  on public.issue_comments(issue_id);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger organization_members_set_updated_at
before update on public.organization_members
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger issues_set_updated_at
before update on public.issues
for each row execute function public.set_updated_at();

create trigger issue_comments_set_updated_at
before update on public.issue_comments
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'User'
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.handle_new_organization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.organization_members (organization_id, profile_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create trigger on_organization_created
after insert on public.organizations
for each row execute function public.handle_new_organization();

create or replace function public.prevent_organization_creator_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.created_by <> old.created_by then
    raise exception 'organization creator cannot be changed';
  end if;
  return new;
end;
$$;

create trigger organizations_prevent_creator_change
before update on public.organizations
for each row execute function public.prevent_organization_creator_change();

create or replace function private.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and profile_id = (select auth.uid())
  );
$$;

create or replace function private.is_organization_owner(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and profile_id = (select auth.uid())
      and role = 'owner'
  );
$$;

revoke all on function private.is_organization_member(uuid) from public;
revoke all on function private.is_organization_owner(uuid) from public;
grant execute on function private.is_organization_member(uuid) to authenticated;
grant execute on function private.is_organization_owner(uuid) to authenticated;
grant usage on schema private to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.projects enable row level security;
alter table public.issues enable row level security;
alter table public.issue_comments enable row level security;

create policy profiles_select
on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or exists (
    select 1
    from public.organization_members member
    where member.profile_id = profiles.id
      and (select private.is_organization_member(member.organization_id))
  )
);

create policy profiles_update
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy organizations_select
on public.organizations for select to authenticated
using ((select private.is_organization_member(id)));

create policy organizations_insert
on public.organizations for insert to authenticated
with check (created_by = (select auth.uid()));

create policy organizations_update
on public.organizations for update to authenticated
using ((select private.is_organization_owner(id)))
with check ((select private.is_organization_owner(id)));

create policy organizations_delete
on public.organizations for delete to authenticated
using ((select private.is_organization_owner(id)));

create policy organization_members_select
on public.organization_members for select to authenticated
using ((select private.is_organization_member(organization_id)));

create policy organization_members_insert
on public.organization_members for insert to authenticated
with check ((select private.is_organization_owner(organization_id)));

create policy organization_members_update
on public.organization_members for update to authenticated
using ((select private.is_organization_owner(organization_id)))
with check ((select private.is_organization_owner(organization_id)));

create policy organization_members_delete
on public.organization_members for delete to authenticated
using ((select private.is_organization_owner(organization_id)));

create policy projects_select
on public.projects for select to authenticated
using ((select private.is_organization_member(organization_id)));

create policy projects_insert
on public.projects for insert to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.is_organization_member(organization_id))
);

create policy projects_update
on public.projects for update to authenticated
using ((select private.is_organization_member(organization_id)))
with check ((select private.is_organization_member(organization_id)));

create policy projects_delete
on public.projects for delete to authenticated
using ((select private.is_organization_member(organization_id)));

create policy issues_select
on public.issues for select to authenticated
using ((select private.is_organization_member(organization_id)));

create policy issues_insert
on public.issues for insert to authenticated
with check (
  reporter_id = (select auth.uid())
  and (select private.is_organization_member(organization_id))
);

create policy issues_update
on public.issues for update to authenticated
using ((select private.is_organization_member(organization_id)))
with check ((select private.is_organization_member(organization_id)));

create policy issues_delete
on public.issues for delete to authenticated
using ((select private.is_organization_member(organization_id)));

create policy issue_comments_select
on public.issue_comments for select to authenticated
using ((select private.is_organization_member(organization_id)));

create policy issue_comments_insert
on public.issue_comments for insert to authenticated
with check (
  author_id = (select auth.uid())
  and (select private.is_organization_member(organization_id))
);

create policy issue_comments_update
on public.issue_comments for update to authenticated
using (author_id = (select auth.uid()))
with check (author_id = (select auth.uid()));

create policy issue_comments_delete
on public.issue_comments for delete to authenticated
using (author_id = (select auth.uid()));

grant select, insert, update, delete
on public.profiles, public.organizations, public.organization_members,
   public.projects, public.issues, public.issue_comments
to authenticated;
