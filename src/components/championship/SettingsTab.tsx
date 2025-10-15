import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { championshipService } from "@/services/championshipService";
import { teamService } from "@/services/teamService";
import { Championship, Team } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Trash2, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";
import ChampionDialog from "./ChampionDialog";

/**
 * Aba de Configurações
 * Permite reset, exclusão e finalização do campeonato
 */

interface SettingsTabProps {
  championship: Championship;
  onUpdate: () => void;
}

export default function SettingsTab({ championship, onUpdate }: SettingsTabProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [championDialogOpen, setChampionDialogOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    loadTeams();
  }, [championship.id]);

  const loadTeams = async () => {
    try {
      const teamsData = await teamService.getByChampionship(championship.id);
      setTeams(teamsData);
    } catch (error) {
      console.error("Erro ao carregar times:", error);
    }
  };

  const handleReset = async () => {
    if (!confirm("Tem certeza que deseja limpar todos os dados de jogos? Times e jogadores serão mantidos.")) {
      return;
    }

    try {
      setLoading(true);
      await championshipService.reset(championship.id);
      toast.success("Campeonato resetado com sucesso!");
      onUpdate();
    } catch (error) {
      console.error("Erro ao resetar campeonato:", error);
      toast.error("Erro ao resetar campeonato");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("⚠️ ATENÇÃO: Tem certeza que deseja EXCLUIR este campeonato? Esta ação é IRREVERSÍVEL e todos os dados (times, jogadores, jogos) serão PERMANENTEMENTE removidos.")) {
      return;
    }

    try {
      setLoading(true);
      await championshipService.delete(championship.id);
      toast.success("Campeonato excluído com sucesso!");
      navigate("/home");
    } catch (error) {
      console.error("Erro ao excluir campeonato:", error);
      toast.error("Erro ao excluir campeonato");
      setLoading(false);
    }
  };

  const handleFinalizeClick = () => {
    if (teams.length === 0) {
      toast.error("Não é possível finalizar um campeonato sem times");
      return;
    }
    setChampionDialogOpen(true);
  };

  const handleFinalize = async (championId: string) => {
    try {
      setLoading(true);
      await championshipService.finalize(championship.id, championId);
      toast.success("Campeonato finalizado com sucesso!");
      setChampionDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Erro ao finalizar campeonato:", error);
      toast.error("Erro ao finalizar campeonato");
    } finally {
      setLoading(false);
    }
  };

  const isFinalized = championship.status === "finalized";

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-display text-foreground">CONFIGURAÇÕES</h3>

      {/* Finalizar campeonato */}
      <Card className="p-6 bg-card border-border card-joga">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Trophy className="w-6 h-6 text-primary mt-1" />
            <div className="flex-1">
              <h4 className="text-lg font-display text-foreground mb-2">FINALIZAR CAMPEONATO</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Finaliza o campeonato e define o campeão. Após finalizar, nenhuma edição será permitida.
              </p>
              <Button
                onClick={handleFinalizeClick}
                disabled={loading || isFinalized}
                className="bg-primary hover:bg-primary-glow text-primary-foreground"
              >
                {isFinalized ? "Campeonato Finalizado" : "Finalizar campeonato"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Reset */}
      <Card className="p-6 bg-card border-border card-joga">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <RotateCcw className="w-6 h-6 text-yellow-500 mt-1" />
            <div className="flex-1">
              <h4 className="text-lg font-display text-foreground mb-2">LIMPAR DADOS</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Remove todos os jogos e estatísticas, mas mantém times e jogadores cadastrados.
              </p>
              <Button
                onClick={handleReset}
                disabled={loading || isFinalized}
                variant="outline"
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
              >
                Limpar campeonato
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Excluir */}
      <Card className="p-6 bg-card border-destructive/50 card-joga">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-destructive mt-1" />
            <div className="flex-1">
              <h4 className="text-lg font-display text-destructive mb-2">ZONA DE PERIGO</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Exclui permanentemente o campeonato e todos os dados relacionados. Esta ação não pode ser desfeita.
              </p>
              <Button
                onClick={handleDelete}
                disabled={loading}
                variant="destructive"
                className="bg-destructive hover:bg-destructive/80"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir campeonato
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Dialog de seleção de campeão */}
      <ChampionDialog
        open={championDialogOpen}
        teams={teams}
        onConfirm={handleFinalize}
        onCancel={() => setChampionDialogOpen(false)}
      />
    </div>
  );
}
