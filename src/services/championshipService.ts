// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";
import type { Championship, CreateChampionshipDTO } from "@/types/models";

/**
 * Serviço para gerenciar campeonatos
 * Responsável por todas as operações CRUD de campeonatos
 */

export const championshipService = {
  /**
   * Busca todos os campeonatos do usuário logado
   */
  async getAll(): Promise<Championship[]> {
    const { data, error } = await supabase
      .from('championships')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Championship[];
  },

  /**
   * Busca um campeonato específico por ID
   */
  async getById(id: string): Promise<Championship | null> {
    const { data, error } = await supabase
      .from('championships')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data as Championship;
  },

  /**
   * Cria um novo campeonato
   * Owner_id é definido automaticamente pelo RLS usando auth.uid()
   */
  async create(data: CreateChampionshipDTO): Promise<Championship> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    const { data: championship, error } = await supabase
      .from('championships')
      .insert({
        nome: data.nome,
        owner_id: user.user.id,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return championship as Championship;
  },

  /**
   * Atualiza um campeonato existente
   */
  async update(id: string, data: Partial<Championship>): Promise<Championship> {
    const { data: championship, error } = await supabase
      .from('championships')
      .update(data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return championship as Championship;
  },

  /**
   * Deleta um campeonato
   * Cascade delete irá remover automaticamente times, jogadores, partidas e eventos
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('championships')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Finaliza um campeonato
   * Muda o status para 'finalized', define o campeão e trava edições futuras
   */
  async finalize(id: string, championId: string): Promise<Championship> {
    return this.update(id, { status: 'finalized', champion_id: championId });
  },

  /**
   * Reseta um campeonato
   * Limpa dados de jogos mas mantém times e jogadores
   */
  async reset(id: string): Promise<void> {
    // Primeiro busca os IDs das partidas
    const { data: matches } = await supabase
      .from('matches')
      .select('id')
      .eq('championship_id', id);

    if (matches && matches.length > 0) {
      const matchIds = matches.map((m: any) => m.id);
      
      // Remove todos os eventos de partida
      await supabase
        .from('match_events')
        .delete()
        .in('match_id', matchIds);
    }

    // Remove todas as partidas
    await supabase
      .from('matches')
      .delete()
      .eq('championship_id', id);

    // Reseta estatísticas dos jogadores
    const { data: teams } = await supabase
      .from('teams')
      .select('id')
      .eq('championship_id', id);

    if (teams && teams.length > 0) {
      const teamIds = teams.map((t: any) => t.id);
      await supabase
        .from('players')
        .update({ total_gols: 0, total_assists: 0 } as any)
        .in('team_id', teamIds);
    }

    // Atualiza status do campeonato
    await this.update(id, { status: 'reset' });
  },
};