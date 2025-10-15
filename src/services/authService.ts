import { supabase } from "@/integrations/supabase/client";

/**
 * Serviço de autenticação - gerencia login, cadastro e recuperação de senha
 * Centraliza toda a lógica de autenticação da aplicação
 */

export interface SignUpData {
  email: string;
  password: string;
  nome: string;
  telefone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  /**
   * Realiza cadastro de novo usuário
   * Importante: dados adicionais (nome, telefone) são salvos em metadata
   * e automaticamente inseridos na tabela profiles via trigger do banco
   */
  async signUp({ email, password, nome, telefone }: SignUpData) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          nome,
          telefone: telefone || '',
        },
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Realiza login do usuário
   */
  async signIn({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Realiza logout do usuário
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Envia email de recuperação de senha
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  },

  /**
   * Atualiza a senha do usuário (após reset)
   */
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  /**
   * Obtém a sessão atual
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Obtém o usuário atual
   */
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },
};