import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Trophy, LogIn, Loader2 } from "lucide-react";

/**
 * Página inicial - Landing page
 * Redireciona para /home se usuário já estiver autenticado
 * Caso contrário, exibe landing page com opção de login
 */

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/home");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center mt-6 md:mt-10">
            <div className="bg-gradient-primary p-8 rounded-2xl shadow-neon-strong animate-glow">
              <Trophy className="w-20 h-20 text-primary-foreground" />
            </div>
          </div>

          {/* Título */}
          <div className="space-y-4">
            <h1 className="text-7xl md:text-8xl font-display text-primary neon-glow animate-fade-in">
              JOGA+
            </h1>
            <p className="text-xl md:text-2xl text-foreground font-body max-w-2xl mx-auto">
              Gerencie seus campeonatos com estilo.
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Times, jogadores, partidas, estatísticas e muito mais. Tudo em um só lugar.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary-glow text-primary-foreground font-semibold text-lg px-8 py-6 shadow-neon hover-scale"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Começar agora
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="card-joga p-6 space-y-2">
              <div className="text-4xl">⚽</div>
              <h3 className="font-display text-lg text-foreground">TIMES & JOGADORES</h3>
              <p className="text-sm text-muted-foreground">
                Crie e gerencie seus times com cores personalizadas
              </p>
            </div>
            <div className="card-joga p-6 space-y-2">
              <div className="text-4xl">🏆</div>
              <h3 className="font-display text-lg text-foreground">PARTIDAS</h3>
              <p className="text-sm text-muted-foreground">
                Agende jogos e registre placares em tempo real
              </p>
            </div>
            <div className="card-joga p-6 space-y-2">
              <div className="text-4xl">📊</div>
              <h3 className="font-display text-lg text-foreground">ESTATÍSTICAS</h3>
              <p className="text-sm text-muted-foreground">
                Acompanhe artilharia, assistências e classificação
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Joga+ © 2025 - Gerencie seus campeonatos com estilo
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
