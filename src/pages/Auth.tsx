import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

/**
 * Página de autenticação
 * Permite alternar entre login e cadastro
 * Redireciona automaticamente se usuário já estiver autenticado
 */

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redireciona se usuário já está logado
  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary text-xl font-display">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo e título */}
        <div className="text-center space-y-2 pt-8">
          <div className="flex justify-center">
            <div className="bg-gradient-primary p-4 rounded-xl shadow-neon">
              <Trophy className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-display text-primary neon-glow">
            JOGA+
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus campeonatos com estilo
          </p>
        </div>

        {/* Card de autenticação */}
        <Card className="p-8 bg-card border-border card-joga">
          <div className="space-y-6">
            {/* Botões de alternância */}
            <div className="flex gap-2 p-1 bg-secondary rounded-lg">
              <Button
                variant={mode === "login" ? "default" : "ghost"}
                onClick={() => setMode("login")}
                className={`flex-1 ${
                  mode === "login"
                    ? "bg-primary hover:bg-primary-glow text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                Entrar
              </Button>
              <Button
                variant={mode === "signup" ? "default" : "ghost"}
                onClick={() => setMode("signup")}
                className={`flex-1 ${
                  mode === "signup"
                    ? "bg-primary hover:bg-primary-glow text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                Cadastrar
              </Button>
            </div>

            {/* Formulários */}
            {mode === "login" ? <LoginForm /> : <SignUpForm />}
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              Esqueceu sua senha?{" "}
              <button 
                onClick={() => navigate("/auth/forgot-password")} 
                className="text-primary hover:underline"
              >
                Recuperar
              </button>
            </>
          ) : (
            <>
              Ao criar uma conta, você concorda com nossos{" "}
              <button className="text-primary hover:underline">
                Termos de Uso
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}