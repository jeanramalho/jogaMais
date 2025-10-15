import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { championshipService } from "@/services/championshipService";
import { Championship } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";
import TeamsTab from "@/components/championship/TeamsTab";
import MatchesTab from "@/components/championship/MatchesTab";
import StatsTab from "@/components/championship/StatsTab";
import SettingsTab from "@/components/championship/SettingsTab";

/**
 * Página de detalhes do campeonato
 * Exibe abas com Times, Jogos, Estatísticas e Configurações
 */

export default function ChampionshipDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [championship, setChampionship] = useState<Championship | null>(null);
  const [loading, setLoading] = useState(true);

  // Redireciona para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Carrega dados do campeonato
  useEffect(() => {
    if (id && user) {
      loadChampionship();
    }
  }, [id, user]);

  const loadChampionship = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await championshipService.getById(id);
      if (!data) {
        toast.error("Campeonato não encontrado");
        navigate("/home");
        return;
      }
      setChampionship(data);
    } catch (error) {
      console.error("Erro ao carregar campeonato:", error);
      toast.error("Erro ao carregar campeonato");
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const handleChampionshipUpdate = () => {
    loadChampionship();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!championship) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-display text-foreground">
                  {championship.nome}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {championship.status === "active"
                    ? "Ativo"
                    : championship.status === "finalized"
                    ? "Finalizado"
                    : "Reset"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="teams" className="space-y-6" key={championship.id}>
          <TabsList className="grid w-full grid-cols-4 bg-card/50 border border-border">
            <TabsTrigger value="teams" className="font-display">
              TIMES
            </TabsTrigger>
            <TabsTrigger value="matches" className="font-display">
              JOGOS
            </TabsTrigger>
            <TabsTrigger value="stats" className="font-display">
              ESTATÍSTICAS
            </TabsTrigger>
            <TabsTrigger value="settings" className="font-display">
              CONFIGURAÇÕES
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teams">
            <TeamsTab championshipId={championship.id} championship={championship} />
          </TabsContent>

          <TabsContent value="matches">
            <MatchesTab championshipId={championship.id} championship={championship} />
          </TabsContent>

          <TabsContent value="stats">
            <StatsTab championshipId={championship.id} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab 
              championship={championship} 
              onUpdate={handleChampionshipUpdate}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
