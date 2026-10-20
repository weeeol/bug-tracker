-- Run after `supabase db reset` against the local Supabase database.
begin;

set local role authenticated;

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000001',
  true
);

do $$
declare
  visible_organizations integer;
  visible_issues integer;
  created_project_id uuid;
  visible_comments integer;
  invalid_assignee_rejected boolean := false;
  cross_tenant_issue_denied boolean := false;
  cross_tenant_comment_denied boolean := false;
begin
  select count(*) into visible_organizations from public.organizations;
  if visible_organizations <> 1 then
    raise exception 'cross-organization read failed: expected 1 organization, got %', visible_organizations;
  end if;

  select count(*) into visible_issues from public.issues;
  if visible_issues <> 1 then
    raise exception 'cross-organization issue read failed: expected 1 issue, got %', visible_issues;
  end if;

  select count(*) into visible_comments from public.issue_comments;
  if visible_comments <> 1 then
    raise exception 'cross-organization comment read failed: expected 1 comment, got %', visible_comments;
  end if;

  insert into public.projects (organization_id, name, slug, created_by)
  values (
    '10000000-0000-0000-0000-000000000001',
    'Local policy test',
    'local-policy-test',
    '00000000-0000-0000-0000-000000000001'
  )
  returning id into created_project_id;

  if created_project_id is null then
    raise exception 'valid member project insert was denied';
  end if;

  if exists (
    select 1
    from public.projects
    where organization_id = '10000000-0000-0000-0000-000000000002'
  ) then
    raise exception 'cross-organization project read was not denied';
  end if;

  begin
    insert into public.issues (
      organization_id, project_id, reporter_id, assignee_id, title
    )
    values (
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000004',
      'Invalid cross-organization assignee'
    );
  exception
    when foreign_key_violation then
      invalid_assignee_rejected := true;
  end;

  if not invalid_assignee_rejected then
    raise exception 'cross-organization assignee was not rejected';
  end if;

  begin
    insert into public.issues (
      organization_id, project_id, reporter_id, title
    )
    values (
      '10000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000001',
      'Cross-organization issue write'
    );
  exception
    when insufficient_privilege then
      cross_tenant_issue_denied := true;
  end;

  if not cross_tenant_issue_denied then
    raise exception 'cross-organization issue insert was not denied';
  end if;

  begin
    insert into public.issue_comments (
      organization_id, issue_id, author_id, body
    )
    values (
      '10000000-0000-0000-0000-000000000002',
      '30000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000001',
      'Cross-organization comment write'
    );
  exception
    when insufficient_privilege then
      cross_tenant_comment_denied := true;
  end;

  if not cross_tenant_comment_denied then
    raise exception 'cross-organization comment insert was not denied';
  end if;

  insert into public.issue_comments (
    organization_id, issue_id, author_id, body
  )
  values (
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Tenant-scoped comment write'
  );
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000003',
  true
);

do $$
declare
  membership_write_denied boolean := false;
begin
  begin
    insert into public.organization_members (
      organization_id, profile_id, role
    )
    values (
      '10000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002',
      'member'
    );
  exception
    when insufficient_privilege then
      membership_write_denied := true;
  end;

  if not membership_write_denied then
    raise exception 'non-owner membership insert was not denied';
  end if;
end;
$$;

rollback;
