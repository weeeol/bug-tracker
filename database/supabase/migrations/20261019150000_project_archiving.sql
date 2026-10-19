alter table public.projects
add column archived_at timestamptz;

create index projects_active_organization_id_idx
  on public.projects(organization_id)
  where archived_at is null;
