// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";
import type { Player, CreatePlayerDTO } from "@/types/models";

/**
 * Serviço para gerenciar jogadores
 * Responsável por todas as operações CRUD de jogadores
 */

export const playerService = {
  /**
   * Busca todos os jogadores de um time
   */
  async getByTeam(teamId: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId)
      .order('numero', { ascending: true });

    if (error) throw error;
    return (data || []) as Player[];
  },

  /**
   * Busca todos os jogadores de um campeonato (via times)
   */
  async getByChampionship(championshipId: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select(`
        *,
        teams!inner(championship_id)
      `)
      .eq('teams.championship_id', championshipId)
      .order('total_gols', { ascending: false });

    if (error) throw error;
    return (data || []) as Player[];
  },

  /**
   * Cria um novo jogador
   */
  async create(data: CreatePlayerDTO): Promise<Player> {
    const { data: player, error } = await supabase
      .from('players')
      .insert(data as any)
      .select()
      .single();

    if (error) throw error;
    return player as Player;
  },

  /**
   * Atualiza um jogador existente
   */
  async update(id: string, data: Partial<Player>): Promise<Player> {
    const { data: player, error } = await supabase
      .from('players')
      .update(data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return player as Player;
  },

  /**
   * Deleta um jogador
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
