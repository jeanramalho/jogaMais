// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";
import type { Team, CreateTeamDTO } from "@/types/models";

/**
 * Serviço para gerenciar times
 * Responsável por todas as operações CRUD de times
 */

export const teamService = {
  /**
   * Busca todos os times de um campeonato
   */
  async getByChampionship(championshipId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('championship_id', championshipId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as Team[];
  },

  /**
   * Busca um time específico por ID
   */
  async getById(id: string): Promise<Team | null> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Team;
  },

  /**
   * Cria um novo time
   */
  async create(data: CreateTeamDTO): Promise<Team> {
    const { data: team, error } = await supabase
      .from('teams')
      .insert(data as any)
      .select()
      .single();

    if (error) throw error;
    return team as Team;
  },

  /**
   * Atualiza um time existente
   */
  async update(id: string, data: Partial<Team>): Promise<Team> {
    const { data: team, error } = await supabase
      .from('teams')
      .update(data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return team as Team;
  },

  /**
   * Deleta um time
   * Cascade delete irá remover automaticamente jogadores e eventos relacionados
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
