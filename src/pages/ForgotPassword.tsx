import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";

/**
 * Página de Recuperação de Senha
 * Verifica email e telefone para permitir redefinição
 * NOTA: Implementação simplificada - funcionalidade completa requer Edge Function
 */

interface Profile {
  id: string;
  nome: string;
  telefone: string | null;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"verify" | "reset">("verify");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Digite um email válido");
      return;
    }

    if (!telefone) {
      toast.error("Digite seu telefone");
      return;
    }

    try {
      setLoading(true);
      
      // Buscar perfil com telefone correspondente
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, nome, telefone')
        .returns<Profile[]>();

      if (error || !profiles || profiles.length === 0) {
        toast.error("Dados não encontrados. Use a recuperação de senha por email.");
        setLoading(false);
        return;
      }

      // Verificar se algum perfil tem o telefone correspondente
      const matchingProfile = profiles.find(p => p.telefone === telefone);
      
      if (matchingProfile) {
        setUserId(matchingProfile.id);
        toast.info("Funcionalidade de recuperação por email e telefone requer configuração adicional. Use a recuperação por email padrão.");
        
        // Redirecionar de volta ao login após 3 segundos
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      } else {
        toast.error("Email ou telefone não encontrados");
      }
      
    } catch (error) {
      console.error("Erro ao verificar dados:", error);
      toast.error("Erro ao verificar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    try {
      setLoading(true);
      
      // Esta funcionalidade requer um Edge Function para funcionar completamente
      // pois não podemos atualizar a senha de outro usuário via client
      toast.info("Esta funcionalidade requer configuração adicional. Use a recuperação de senha por email.");
      
      // Redirecionar de volta
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
      
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      toast.error("Erro ao redefinir senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-card border-border">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary p-2 rounded-lg shadow-neon">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display text-foreground">RECUPERAR SENHA</h1>
              <p className="text-sm text-muted-foreground">
                {step === "verify" ? "Confirme seus dados" : "Defina nova senha"}
              </p>
            </div>
          </div>

          {step === "verify" ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="bg-secondary border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="bg-secondary border-border"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Digite o telefone cadastrado na sua conta
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-glow text-primary-foreground"
              >
                {loading ? "Verificando..." : "Verificar dados"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/auth")}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao login
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="bg-secondary border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  className="bg-secondary border-border"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-glow text-primary-foreground"
              >
                {loading ? "Atualizando..." : "Atualizar senha"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep("verify");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
