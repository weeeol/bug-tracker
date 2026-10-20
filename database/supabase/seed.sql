-- Deterministic local-only fixtures. These values are not production credentials.
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'ada@example.test',
    crypt('local-test-password', gen_salt('bf')), timezone('utc', now()),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Ada Lovelace"}'::jsonb,
    timezone('utc', now()), timezone('utc', now()), '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'grace@example.test',
    crypt('local-test-password', gen_salt('bf')), timezone('utc', now()),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Grace Hopper"}'::jsonb,
    timezone('utc', now()), timezone('utc', now()), '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'margaret@example.test',
    crypt('local-test-password', gen_salt('bf')), timezone('utc', now()),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Margaret Hamilton"}'::jsonb,
    timezone('utc', now()), timezone('utc', now()), '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'katherine@example.test',
    crypt('local-test-password', gen_salt('bf')), timezone('utc', now()),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Katherine Johnson"}'::jsonb,
    timezone('utc', now()), timezone('utc', now()), '', ''
  )
on conflict (id) do nothing;

update auth.users
set
  email_change = '',
  phone_change = '',
  email_change_token_new = '',
  phone_change_token = '',
  email_change_confirm_status = 0
where id in (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004'
);

insert into public.profiles (id, display_name)
values
  ('00000000-0000-0000-0000-000000000001', 'Ada Lovelace'),
  ('00000000-0000-0000-0000-000000000002', 'Grace Hopper'),
  ('00000000-0000-0000-0000-000000000003', 'Margaret Hamilton'),
  ('00000000-0000-0000-0000-000000000004', 'Katherine Johnson')
on conflict (id) do update set display_name = excluded.display_name;

insert into public.organizations (id, name, slug, created_by)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'Analytical Engines',
    'analytical-engines',
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Relay Labs',
    'relay-labs',
    '00000000-0000-0000-0000-000000000002'
  )
on conflict (id) do nothing;

insert into public.organization_members (organization_id, profile_id, role)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'member'
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'member'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    'member'
  )
on conflict (organization_id, profile_id) do update set role = excluded.role;

insert into public.projects (id, organization_id, name, slug, created_by)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Compiler',
    'compiler',
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'Telemetry',
    'telemetry',
    '00000000-0000-0000-0000-000000000002'
  )
on conflict (id) do nothing;

insert into public.issues (
  id, organization_id, project_id, reporter_id, assignee_id,
  title, description, status, priority
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Parser loses line numbers',
    'A malformed token causes the parser location to reset.',
    'open',
    'high'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    null,
    'Export retries indefinitely',
    'The export worker needs a bounded retry policy.',
    'in_progress',
    'medium'
  )
on conflict (id) do nothing;

insert into public.issue_comments (organization_id, issue_id, author_id, body)
values (
  '10000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'I can reproduce this with the current parser fixture.'
)
on conflict do nothing;
