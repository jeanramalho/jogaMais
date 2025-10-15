import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/**
 * Formulário de login
 * Validação simples de email e senha antes de enviar para o backend
 */

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Email inválido");
      return;
    }

    setLoading(true);

    try {
      await signIn({ email, password });
      toast.success("Login realizado com sucesso!");
      navigate("/");
    } catch (error: any) {
      console.error("Erro no login:", error);
      
      // Mensagens de erro amigáveis
      if (error.message?.includes("Invalid login credentials")) {
        toast.error("Email ou senha incorretos");
      } else if (error.message?.includes("Email not confirmed")) {
        toast.error("Confirme seu email antes de fazer login");
      } else {
        toast.error("Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="bg-secondary border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">
          Senha
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="bg-secondary border-border"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-glow text-primary-foreground font-semibold"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
}