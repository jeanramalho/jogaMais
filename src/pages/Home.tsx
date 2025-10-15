import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { championshipService } from "@/services/championshipService";
import { Championship } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trophy, Plus, LogOut, Loader2, User } from "lucide-react";
import { toast } from "sonner";

/**
 * Página Home
 * Exibe lista de campeonatos do usuário
 * Permite criar novo campeonato
 */

export default function Home() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newChampionshipName, setNewChampionshipName] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  // Redireciona para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Carrega campeonatos
  useEffect(() => {
    if (user) {
      loadChampionships();
    }
  }, [user]);

  const loadChampionships = async () => {
    try {
      setLoading(true);
      const data = await championshipService.getAll();
      setChampionships(data);
    } catch (error) {
      console.error("Erro ao carregar campeonatos:", error);
      toast.error("Erro ao carregar campeonatos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChampionship = async () => {
    if (!newChampionshipName.trim()) {
      toast.error("Digite um nome para o campeonato");
      return;
    }

    try {
      setCreating(true);
      const newChampionship = await championshipService.create({
        nome: newChampionshipName,
      });
      
      toast.success("Campeonato criado com sucesso!");
      setNewChampionshipName("");
      setCreateModalOpen(false);
      
      // Navega para o campeonato recém-criado
      navigate(`/championship/${newChampionship.id}`);
    } catch (error) {
      console.error("Erro ao criar campeonato:", error);
      toast.error("Erro ao criar campeonato");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso");
      navigate("/auth");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary p-2 rounded-lg shadow-neon">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-display text-primary">JOGA+</h1>
                <p className="text-xs text-muted-foreground">
                  {profile?.nome || user?.email}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile")}
                className="text-muted-foreground hover:text-foreground"
                title="Meu perfil"
              >
                <User className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Botão criar campeonato */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-display text-foreground">
                MEUS CAMPEONATOS
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie todos os seus campeonatos
              </p>
            </div>
            
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-glow text-primary-foreground font-semibold shadow-neon">
                  <Plus className="w-5 h-5 mr-2" />
                  Novo Campeonato
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">
                    CRIAR CAMPEONATO
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do campeonato</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Copa Verão 2025"
                      value={newChampionshipName}
                      onChange={(e) => setNewChampionshipName(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <Button
                    onClick={handleCreateChampionship}
                    disabled={creating}
                    className="w-full bg-primary hover:bg-primary-glow text-primary-foreground"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar campeonato"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de campeonatos */}
          {championships.length === 0 ? (
            <Card className="p-12 text-center bg-card border-border card-joga">
              <div className="space-y-4">
                <Trophy className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-xl font-display text-foreground">
                    NENHUM CAMPEONATO AINDA
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Crie seu primeiro campeonato e comece a gerenciar seus jogos
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {championships.map((championship) => (
                <Card
                  key={championship.id}
                  className="p-6 cursor-pointer card-joga hover-scale"
                  onClick={() => navigate(`/championship/${championship.id}`)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <Trophy className="w-8 h-8 text-primary" />
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          championship.status === "active"
                            ? "bg-primary/20 text-primary"
                            : championship.status === "finalized"
                            ? "bg-accent/20 text-accent"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {championship.status === "active"
                          ? "Ativo"
                          : championship.status === "finalized"
                          ? "Finalizado"
                          : "Reset"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-display text-foreground">
                        {championship.nome}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Criado em{" "}
                        {new Date(championship.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}