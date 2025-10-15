// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, User, Mail, Phone, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Página de Perfil do Usuário
 * Permite editar dados e excluir conta
 */

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        nome: profile.nome || "",
        telefone: profile.telefone || "",
      });
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          nome: formData.nome,
          telefone: formData.telefone || null,
        } as any)
        .eq("id", user?.id);

      if (error) throw error;
      
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      
      // Deletar o perfil (isso irá deletar todos os campeonatos em cascata)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user?.id);

      if (profileError) throw profileError;

      toast.success("Conta excluída com sucesso");
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      toast.error("Erro ao excluir conta.");
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/home")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="bg-gradient-primary p-2 rounded-lg shadow-neon">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-display text-foreground">MEU PERFIL</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Informações da conta */}
          <Card className="p-6 bg-card border-border">
            <div className="space-y-4">
              <h3 className="text-xl font-display text-foreground">INFORMAÇÕES DA CONTA</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground">{user.email}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Editar perfil */}
          <Card className="p-6 bg-card border-border">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <h3 className="text-xl font-display text-foreground">EDITAR PERFIL</h3>
              
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Seu nome"
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="bg-secondary border-border"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-glow text-primary-foreground"
              >
                {loading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </form>
          </Card>

          {/* Zona de perigo */}
          <Card className="p-6 bg-card border-destructive/50">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Trash2 className="w-6 h-6 text-destructive mt-1" />
                <div className="flex-1">
                  <h4 className="text-lg font-display text-destructive mb-2">ZONA DE PERIGO</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Excluir sua conta é permanente. Todos os seus campeonatos, times, jogadores e jogos serão removidos. Esta ação não pode ser desfeita.
                  </p>
                  <Button
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={loading}
                    variant="destructive"
                    className="bg-destructive hover:bg-destructive/80"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir minha conta
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive font-display text-2xl">
              ⚠️ ATENÇÃO
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza absoluta que deseja excluir sua conta? Esta ação é IRREVERSÍVEL e todos os seus dados serão PERMANENTEMENTE removidos:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Todos os campeonatos</li>
                <li>Todos os times e jogadores</li>
                <li>Todos os jogos e estatísticas</li>
                <li>Seu perfil e informações pessoais</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary text-foreground hover:bg-secondary/80">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive hover:bg-destructive/80 text-destructive-foreground"
            >
              Sim, excluir minha conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
