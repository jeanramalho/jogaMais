-- Criar tabela de perfis de usuários
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  telefone text,
  created_at timestamptz default now()
);

-- Habilitar RLS na tabela profiles
alter table public.profiles enable row level security;

-- Policy: usuários podem ver apenas seu próprio perfil
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Policy: usuários podem atualizar apenas seu próprio perfil
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Policy: usuários podem inserir apenas seu próprio perfil
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Criar tabela de campeonatos
create table public.championships (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  nome text not null,
  status text default 'active' check (status in ('active', 'finalized', 'reset')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilitar RLS na tabela championships
alter table public.championships enable row level security;

-- Policy: usuários podem ver apenas seus próprios campeonatos
create policy "Users can view own championships"
  on public.championships for select
  using (auth.uid() = owner_id);

-- Policy: usuários podem criar campeonatos
create policy "Users can create championships"
  on public.championships for insert
  with check (auth.uid() = owner_id);

-- Policy: usuários podem atualizar apenas seus próprios campeonatos
create policy "Users can update own championships"
  on public.championships for update
  using (auth.uid() = owner_id);

-- Policy: usuários podem deletar apenas seus próprios campeonatos
create policy "Users can delete own championships"
  on public.championships for delete
  using (auth.uid() = owner_id);

-- Criar tabela de times
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  championship_id uuid references public.championships(id) on delete cascade not null,
  nome text not null,
  color_a varchar(7) not null,
  color_b varchar(7),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Criar índice para melhor performance em queries por campeonato
create index idx_teams_championship on public.teams(championship_id);

-- Habilitar RLS na tabela teams
alter table public.teams enable row level security;

-- Policy: usuários podem ver times dos seus campeonatos
create policy "Users can view teams from own championships"
  on public.teams for select
  using (
    exists (
      select 1 from public.championships
      where championships.id = teams.championship_id
      and championships.owner_id = auth.uid()
    )
  );

-- Policy: usuários podem criar times nos seus campeonatos
create policy "Users can create teams in own championships"
  on public.teams for insert
  with check (
    exists (
      select 1 from public.championships
      where championships.id = championship_id
      and championships.owner_id = auth.uid()
    )
  );

-- Policy: usuários podem atualizar times dos seus campeonatos
create policy "Users can update teams from own championships"
  on public.teams for update
  using (
    exists (
      select 1 from public.championships
      where championships.id = teams.championship_id
      and championships.owner_id = auth.uid()
    )
  );

-- Policy: usuários podem deletar times dos seus campeonatos
create policy "Users can delete teams from own championships"
  on public.teams for delete
  using (
    exists (
      select 1 from public.championships
      where championships.id = teams.championship_id
      and championships.owner_id = auth.uid()
    )
  );

-- Criar tabela de jogadores
create table public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  nome text not null,
  numero int,
  posicao text,
  total_gols int default 0,
  total_assists int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Criar índice para melhor performance
create index idx_players_team on public.players(team_id);

-- Habilitar RLS na tabela players
alter table public.players enable row level security;

-- Policy: usuários podem ver jogadores dos times dos seus campeonatos
create policy "Users can view players from own championships"
  on public.players for select
  using (
    exists (
      select 1 from public.teams
      join public.championships on championships.id = teams.championship_id
      where teams.id = players.team_id
      and championships.owner_id = auth.uid()
    )
  );

-- Policy: usuários podem criar jogadores nos times dos seus campeonatos
create policy "Users can create players in own championships"
  on public.players for insert
  with check (
    exists (
      select 1 from public.teams
      join public.championships on championships.id = teams.championship_id
      where teams.id = team_id
      and championships.owner_id = auth.uid()
    )
  );

-- Policy: usuários podem atualizar jogadores dos seus campeonatos
create policy "Users can update players from own championships"
  on public.players for update
  using (
    exists (
      select 1 from public.teams
      join public.championships on championships.id = teams.championship_id
      where teams.id = players.team_id
      and championships.owner_id = auth.uid()
    )
  );

-- Policy: usuários podem deletar jogadores dos seus campeonatos
create policy "Users can delete players from own championships"
  on public.players for delete
  using (
    exists (
      select 1 from public.teams
      join public.championships on championships.id = teams.championship_id
      where teams.id = players.team_id
      and championships.owner_id = auth.uid()
    )
  );

-- Criar tabela de partidas
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  championship_id uuid references public.championships(id) on delete cascade not null,
  time_a uuid references public.teams(id) not null,
  time_b uuid references public.teams(id) not null,
  type text,
  scheduled_date date not null,
  scheduled_time time not null,
  score_a int default 0,
  score_b int default 0,
  finalized boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Criar índices para melhor performance
create index idx_matches_championship on public.matches(championship_id);
create index idx_matches_date on public.matches(scheduled_date);

-- Habilitar RLS na tabela matches
alter table public.matches enable row level security;

-- Policy: usuários podem ver partidas dos seus campeonatos
create policy "Users can view matches from own championships"
  on public.matches for select
  using (
    exists (
      select 1 from public.championships
      where championships.id = matches.championship_id
      and championships.owner_id = auth.uid()
    )
  );

-- Policy: usuários podem criar partidas nos seus campeonatos
create policy "Users can create matches in own championships"
  on public.matches for insert
  with check (
    exists (
      select 1 from public.championships
      where championships.id = championship_id
      and championships.owner_id = auth.uid()
    )
  );

-- Policy: usuários podem atualizar partidas dos seus campeonatos
create policy "Users can update matches from own championships"
  on public.matches for update
  using (
    exists (
      select 1 from public.championships
      where championships.id = matches.championship_id
      and championships.owner_id = auth.uid()
    )
  );

-- Policy: usuários podem deletar partidas dos seus campeonatos
create policy "Users can delete matches from own championships"
  on public.matches for delete
  using (
    exists (
      select 1 from public.championships
      where championships.id = matches.championship_id
      and championships.owner_id = auth.uid()
    )
  );

-- Criar tabela de eventos de partida (gols e assistências)
create table public.match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.matches(id) on delete cascade not null,
  player_id uuid references public.players(id) on delete cascade not null,
  team_id uuid references public.teams(id) not null,
  event_type text not null check (event_type in ('gol', 'assist')),
  minute int,
  created_at timestamptz default now()
);

-- Criar índices para melhor performance
create index idx_match_events_match on public.match_events(match_id);
create index idx_match_events_player on public.match_events(player_id);

-- Habilitar RLS na tabela match_events
alter table public.match_events enable row level security;

-- Policy: usuários podem ver eventos das partidas dos seus campeonatos
create policy "Users can view events from own championships"
  on public.match_events for select
  using (
    exists (
      select 1 from public.matches
      join public.championships on championships.id = matches.championship_id
      where matches.id = match_events.match_id
      and championships.owner_id = auth.uid()
    )
  );

-- Policy: usuários podem criar eventos nas partidas dos seus campeonatos
create policy "Users can create events in own championships"
  on public.match_events for insert
  with check (
    exists (
      select 1 from public.matches
      join public.championships on championships.id = matches.championship_id
      where matches.id = match_id
      and championships.owner_id = auth.uid()
    )
  );

-- Policy: usuários podem deletar eventos das partidas dos seus campeonatos
create policy "Users can delete events from own championships"
  on public.match_events for delete
  using (
    exists (
      select 1 from public.matches
      join public.championships on championships.id = matches.championship_id
      where matches.id = match_events.match_id
      and championships.owner_id = auth.uid()
    )
  );

-- Função para atualizar campo updated_at automaticamente
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Triggers para atualizar updated_at em cada tabela
create trigger update_championships_updated_at
  before update on public.championships
  for each row
  execute function public.update_updated_at_column();

create trigger update_teams_updated_at
  before update on public.teams
  for each row
  execute function public.update_updated_at_column();

create trigger update_players_updated_at
  before update on public.players
  for each row
  execute function public.update_updated_at_column();

create trigger update_matches_updated_at
  before update on public.matches
  for each row
  execute function public.update_updated_at_column();

-- Função para criar perfil automaticamente quando usuário se registra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, telefone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', ''),
    coalesce(new.raw_user_meta_data->>'telefone', '')
  );
  return new;
end;
$$;

-- Trigger para criar perfil automaticamente
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();