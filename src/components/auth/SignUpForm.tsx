import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/**
 * Formulário de cadastro
 * Coleta dados do usuário e valida antes de criar conta
 */

export function SignUpForm() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.nome || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!formData.email.includes("@")) {
      toast.error("Email inválido");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        nome: formData.nome,
        telefone: formData.telefone || undefined,
      });
      
      toast.success("Conta criada com sucesso!");
      navigate("/");
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      
      // Mensagens de erro amigáveis
      if (error.message?.includes("User already registered")) {
        toast.error("Este email já está cadastrado");
      } else if (error.message?.includes("Password should be")) {
        toast.error("Senha não atende aos requisitos mínimos");
      } else {
        toast.error("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="nome" className="text-foreground">
          Nome completo *
        </Label>
        <Input
          id="nome"
          type="text"
          placeholder="Seu nome"
          value={formData.nome}
          onChange={(e) => handleChange("nome", e.target.value)}
          disabled={loading}
          className="bg-secondary border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">
          Email *
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          disabled={loading}
          className="bg-secondary border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefone" className="text-foreground">
          Telefone
        </Label>
        <Input
          id="telefone"
          type="tel"
          placeholder="(00) 00000-0000"
          value={formData.telefone}
          onChange={(e) => handleChange("telefone", e.target.value)}
          disabled={loading}
          className="bg-secondary border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">
          Senha *
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          disabled={loading}
          className="bg-secondary border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-foreground">
          Confirmar senha *
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Digite a senha novamente"
          value={formData.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
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
            Criando conta...
          </>
        ) : (
          "Criar conta"
        )}
      </Button>
    </form>
  );
}