import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

/**
 * Página de Recuperação de Senha
 * Envia email com link para redefinir senha
 */

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Digite um email válido");
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(email);
      setSent(true);
      toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      toast.error("Erro ao enviar email de recuperação");
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
              <Mail className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display text-foreground">RECUPERAR SENHA</h1>
              <p className="text-sm text-muted-foreground">
                {sent ? "Email enviado" : "Digite seu email"}
              </p>
            </div>
          </div>

          {sent ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Enviamos um email com instruções para redefinir sua senha. Verifique sua caixa de entrada e spam.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/auth")}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="bg-secondary border-border"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-glow text-primary-foreground"
              >
                {loading ? "Enviando..." : "Enviar email de recuperação"}
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
          )}
        </div>
      </Card>
    </div>
  );
}
