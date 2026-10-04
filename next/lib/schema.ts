export const SCHEMA = `
create table if not exists users (
  id serial primary key,
  email text not null unique,
  name text not null default '',
  password_hash text not null,
  role text not null default 'editor',
  created_at timestamptz not null default now()
);
create table if not exists settings (key text primary key, value text not null default '');
create table if not exists uploads (
  id serial primary key,
  created_at timestamptz not null default now(),
  kind text not null default 'public',
  mime text not null,
  name text not null default '',
  data bytea not null
);
create table if not exists news (
  id serial primary key,
  title text not null,
  body text not null default '',
  date date not null default current_date,
  image text,
  published boolean not null default true
);
create table if not exists calendar (
  id serial primary key,
  title text not null,
  date date not null,
  place text not null default ''
);
create table if not exists athletes (
  id serial primary key,
  name text not null,
  category text not null default '',
  gender text not null default 'H',
  rank int,
  club text not null default '',
  photo text,
  published boolean not null default true
);
create table if not exists bureau (
  id serial primary key,
  name text not null,
  role text not null default '',
  position int not null default 0,
  photo text
);
create table if not exists events (
  id serial primary key,
  slug text not null unique,
  title text not null,
  hook text not null default '',
  poster text,
  dates_label text not null default '',
  place text not null default '',
  start_date date not null,
  deadline date,
  price_label text not null default '',
  infoline text not null default '',
  extra jsonb not null default '[]',
  programme jsonb not null default '[]',
  capacity int,
  registrations_open boolean not null default true,
  published boolean not null default true,
  form jsonb not null default '[]',
  dedupe jsonb not null default '[]',
  confirmation text not null default 'Merci ! Votre inscription est enregistrée.',
  created_at timestamptz not null default now()
);
create table if not exists registrations (
  id serial primary key,
  event_id int not null references events(id) on delete cascade,
  created_at timestamptz not null default now(),
  data jsonb not null,
  files jsonb not null default '{}',
  status text not null default 'inscrit',
  paid boolean not null default false,
  note text not null default ''
);
create index if not exists registrations_event on registrations(event_id, created_at);
create table if not exists messages (
  id serial primary key,
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  subject text not null,
  body text not null,
  handled boolean not null default false
);
`;
