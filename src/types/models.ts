// Tipos de dados do Joga+ - Models para toda a aplicação

export interface Profile {
  id: string;
  nome: string;
  telefone: string | null;
  created_at: string;
}

export interface Championship {
  id: string;
  owner_id: string;
  nome: string;
  status: 'active' | 'finalized' | 'reset';
  champion_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  championship_id: string;
  nome: string;
  color_a: string; // Hex color #RRGGBB
  color_b: string | null; // Segunda cor opcional
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  team_id: string | null;
  nome: string;
  numero: number | null;
  posicao: string | null;
  total_gols: number;
  total_assists: number;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  championship_id: string;
  time_a: string; // Team ID
  time_b: string; // Team ID
  type: string; // grupo, oitavas, quartas, semi, final
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:MM:SS
  score_a: number;
  score_b: number;
  finalized: boolean;
  created_at: string;
  updated_at: string;
}

export interface MatchEvent {
  id: string;
  match_id: string;
  player_id: string;
  team_id: string;
  event_type: 'gol' | 'assist';
  minute: number | null;
  created_at: string;
}

// DTOs para forms e operações
export interface CreateChampionshipDTO {
  nome: string;
}

export interface CreateTeamDTO {
  championship_id: string;
  nome: string;
  color_a: string;
  color_b?: string;
}

export interface CreatePlayerDTO {
  team_id: string;
  nome: string;
  numero?: number;
  posicao?: string;
}

export interface CreateMatchDTO {
  championship_id: string;
  time_a: string;
  time_b: string;
  type: string;
  scheduled_date: string;
  scheduled_time: string;
}

export interface CreateMatchEventDTO {
  match_id: string;
  player_id: string;
  team_id: string;
  event_type: 'gol' | 'assist';
  minute?: number;
}

// Tipos utilitários para estatísticas
export interface PlayerStats {
  player: Player;
  team: Team;
  gols: number;
  assists: number;
}

export interface TeamStats {
  team: Team;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gols_pro: number;
  gols_contra: number;
  saldo: number;
  pontos: number;
}