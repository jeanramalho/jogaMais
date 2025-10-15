// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";
import type { Match, CreateMatchDTO, MatchEvent } from "@/types/models";

/**
 * Serviço para gerenciar partidas e eventos de partida
 * Responsável por CRUD de partidas e marcação de gols/assistências
 */

export const matchService = {
  /**
   * Busca todas as partidas de um campeonato
   */
  async getByChampionship(championshipId: string): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('championship_id', championshipId)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (error) throw error;
    return (data || []) as Match[];
  },

  /**
   * Busca uma partida específica por ID
   */
  async getById(id: string): Promise<Match | null> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Match;
  },

  /**
   * Cria uma nova partida
   */
  async create(data: CreateMatchDTO): Promise<Match> {
    const { data: match, error } = await supabase
      .from('matches')
      .insert(data as any)
      .select()
      .single();

    if (error) throw error;
    return match as Match;
  },

  /**
   * Atualiza uma partida existente
   */
  async update(id: string, data: Partial<Match>): Promise<Match> {
    const { data: match, error } = await supabase
      .from('matches')
      .update(data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return match as Match;
  },

  /**
   * Deleta uma partida
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Finaliza uma partida (impede futuras edições)
   */
  async finalize(id: string): Promise<Match> {
    return this.update(id, { finalized: true });
  },

  /**
   * Busca eventos de uma partida
   */
  async getMatchEvents(matchId: string): Promise<MatchEvent[]> {
    const { data, error } = await supabase
      .from('match_events')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as MatchEvent[];
  },

  /**
   * Adiciona um evento de partida (gol ou assistência)
   * Atualiza automaticamente o placar e estatísticas do jogador
   */
  async addEvent(event: {
    match_id: string;
    player_id: string;
    team_id: string;
    event_type: 'gol' | 'assist';
    minute?: number;
  }): Promise<void> {
    // Adiciona o evento
    const { error: eventError } = await supabase
      .from('match_events')
      .insert(event as any);

    if (eventError) throw eventError;

    // Se for gol, atualiza o placar da partida
    if (event.event_type === 'gol') {
      const match = await this.getById(event.match_id);
      if (!match) throw new Error('Partida não encontrada');

      const isTeamA = match.time_a === event.team_id;
      const newScore = isTeamA ? match.score_a + 1 : match.score_b + 1;

      await this.update(event.match_id, {
        [isTeamA ? 'score_a' : 'score_b']: newScore,
      });

      // Atualiza estatísticas do jogador
      const { data: player } = await supabase
        .from('players')
        .select('total_gols')
        .eq('id', event.player_id)
        .single();

      if (player) {
        await supabase
          .from('players')
          .update({ total_gols: (player as any).total_gols + 1 } as any)
          .eq('id', event.player_id);
      }
    } else if (event.event_type === 'assist') {
      // Atualiza estatísticas de assistência do jogador
      const { data: player } = await supabase
        .from('players')
        .select('total_assists')
        .eq('id', event.player_id)
        .single();

      if (player) {
        await supabase
          .from('players')
          .update({ total_assists: (player as any).total_assists + 1 } as any)
          .eq('id', event.player_id);
      }
    }
  },

  /**
   * Remove um evento de partida
   * Atualiza automaticamente o placar e estatísticas
   */
  async removeEvent(eventId: string): Promise<void> {
    // Busca o evento antes de deletar
    const { data: event } = await supabase
      .from('match_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (!event) throw new Error('Evento não encontrado');

    // Deleta o evento
    const { error } = await supabase
      .from('match_events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;

    // Se for gol, atualiza o placar
    if ((event as any).event_type === 'gol') {
      const match = await this.getById((event as any).match_id);
      if (!match) return;

      const isTeamA = match.time_a === (event as any).team_id;
      const newScore = Math.max(0, isTeamA ? match.score_a - 1 : match.score_b - 1);

      await this.update((event as any).match_id, {
        [isTeamA ? 'score_a' : 'score_b']: newScore,
      });

      // Atualiza estatísticas do jogador
      const { data: player } = await supabase
        .from('players')
        .select('total_gols')
        .eq('id', (event as any).player_id)
        .single();

      if (player && (player as any).total_gols > 0) {
        await supabase
          .from('players')
          .update({ total_gols: (player as any).total_gols - 1 } as any)
          .eq('id', (event as any).player_id);
      }
    } else if ((event as any).event_type === 'assist') {
      const { data: player } = await supabase
        .from('players')
        .select('total_assists')
        .eq('id', (event as any).player_id)
        .single();

      if (player && (player as any).total_assists > 0) {
        await supabase
          .from('players')
          .update({ total_assists: (player as any).total_assists - 1 } as any)
          .eq('id', (event as any).player_id);
      }
    }
  },
};
