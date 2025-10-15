import { useEffect, useState } from "react";
import { teamService } from "@/services/teamService";
import { playerService } from "@/services/playerService";
import { Team, Player, Championship } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, Trash2, Edit, UserPlus, Trophy } from "lucide-react";
import { toast } from "sonner";

/**
 * Aba de Times
 * Gerencia CRUD de times e jogadores
 */

interface TeamsTabProps {
  championshipId: string;
  championship: Championship;
}

export default function TeamsTab({ championshipId, championship }: TeamsTabProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Record<string, Player[]>>({});
  const [loading, setLoading] = useState(true);
  
  // Modais
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  // Formulários
  const [teamForm, setTeamForm] = useState({ nome: "", color_a: "#00FF66", color_b: "#FFFFFF" });
  const [playerForm, setPlayerForm] = useState({ nome: "", numero: "", posicao: "", team_id: "" });

  useEffect(() => {
    loadTeams();
  }, [championshipId]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const teamsData = await teamService.getByChampionship(championshipId);
      setTeams(teamsData);

      // Carrega jogadores de cada time
      const playersData: Record<string, Player[]> = {};
      for (const team of teamsData) {
        const teamPlayers = await playerService.getByTeam(team.id);
        playersData[team.id] = teamPlayers;
      }
      setPlayers(playersData);
    } catch (error) {
      console.error("Erro ao carregar times:", error);
      toast.error("Erro ao carregar times");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamForm.nome.trim()) {
      toast.error("Digite um nome para o time");
      return;
    }

    try {
      await teamService.create({
        championship_id: championshipId,
        ...teamForm,
      });
      toast.success("Time criado com sucesso!");
      setTeamForm({ nome: "", color_a: "#00FF66", color_b: "#FFFFFF" });
      setTeamModalOpen(false);
      loadTeams();
    } catch (error) {
      console.error("Erro ao criar time:", error);
      toast.error("Erro ao criar time");
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Tem certeza que deseja excluir este time? Todos os jogadores serão removidos.")) {
      return;
    }

    try {
      await teamService.delete(teamId);
      toast.success("Time excluído com sucesso!");
      loadTeams();
    } catch (error) {
      console.error("Erro ao excluir time:", error);
      toast.error("Erro ao excluir time");
    }
  };

  const handleCreatePlayer = async () => {
    if (!playerForm.nome.trim() || !playerForm.team_id) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      await playerService.create({
        team_id: playerForm.team_id,
        nome: playerForm.nome,
        numero: playerForm.numero ? parseInt(playerForm.numero) : undefined,
        posicao: playerForm.posicao || undefined,
      });
      toast.success("Jogador adicionado com sucesso!");
      setPlayerForm({ nome: "", numero: "", posicao: "", team_id: "" });
      setPlayerModalOpen(false);
      loadTeams();
    } catch (error) {
      console.error("Erro ao adicionar jogador:", error);
      toast.error("Erro ao adicionar jogador");
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm("Tem certeza que deseja remover este jogador?")) {
      return;
    }

    try {
      await playerService.delete(playerId);
      toast.success("Jogador removido com sucesso!");
      loadTeams();
    } catch (error) {
      console.error("Erro ao remover jogador:", error);
      toast.error("Erro ao remover jogador");
    }
  };

  const isFinalized = championship.status === "finalized";

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando times...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Botão criar time */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-display text-foreground">TIMES</h3>
        {!isFinalized && (
          <Dialog open={teamModalOpen} onOpenChange={setTeamModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-glow text-primary-foreground shadow-neon">
                <Plus className="w-5 h-5 mr-2" />
                Novo Time
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">CRIAR TIME</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">Nome do time</Label>
                  <Input
                    id="team-name"
                    placeholder="Ex: Águias Celestes"
                    value={teamForm.nome}
                    onChange={(e) => setTeamForm({ ...teamForm, nome: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color-a">Cor 1</Label>
                    <Input
                      id="color-a"
                      type="color"
                      value={teamForm.color_a}
                      onChange={(e) => setTeamForm({ ...teamForm, color_a: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color-b">Cor 2</Label>
                    <Input
                      id="color-b"
                      type="color"
                      value={teamForm.color_b}
                      onChange={(e) => setTeamForm({ ...teamForm, color_b: e.target.value })}
                      className="h-10"
                    />
                  </div>
                </div>
                <Button onClick={handleCreateTeam} className="w-full bg-primary hover:bg-primary-glow text-primary-foreground">
                  Criar time
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Lista de times */}
      {teams.length === 0 ? (
        <Card className="p-12 text-center bg-card border-border">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum time criado ainda</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {teams.map((team) => (
            <Card key={team.id} className="p-6 bg-card border-border card-joga">
              <div className="space-y-4">
                {/* Header do time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: team.color_a }}
                      />
                      {team.color_b && (
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: team.color_b }}
                        />
                      )}
                    </div>
                    <h4 className="text-xl font-display text-foreground">{team.nome}</h4>
                    {championship.champion_id === team.id && (
                      <div title="Campeão">
                        <Trophy className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </div>
                  {!isFinalized && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setPlayerForm({ ...playerForm, team_id: team.id });
                          setPlayerModalOpen(true);
                        }}
                        className="text-primary hover:text-primary-glow"
                      >
                        <UserPlus className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTeam(team.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Lista de jogadores */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-semibold">JOGADORES</p>
                  {(!players[team.id] || players[team.id].length === 0) ? (
                    <p className="text-sm text-muted-foreground italic">Nenhum jogador adicionado</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {players[team.id].map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-2 bg-secondary rounded border border-border"
                        >
                          <div className="flex items-center gap-2">
                            {player.numero && (
                              <span className="text-xs font-bold text-primary">#{player.numero}</span>
                            )}
                            <span className="text-sm text-foreground">{player.nome}</span>
                            {player.posicao && (
                              <span className="text-xs text-muted-foreground">({player.posicao})</span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePlayer(player.id)}
                            className="h-6 w-6 text-destructive hover:text-destructive/80"
                            disabled={isFinalized}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de adicionar jogador */}
      <Dialog open={playerModalOpen} onOpenChange={setPlayerModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">ADICIONAR JOGADOR</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="player-name">Nome *</Label>
              <Input
                id="player-name"
                placeholder="Nome do jogador"
                value={playerForm.nome}
                onChange={(e) => setPlayerForm({ ...playerForm, nome: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="player-number">Número</Label>
                <Input
                  id="player-number"
                  type="number"
                  placeholder="10"
                  value={playerForm.numero}
                  onChange={(e) => setPlayerForm({ ...playerForm, numero: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="player-position">Posição</Label>
                <Input
                  id="player-position"
                  placeholder="Atacante"
                  value={playerForm.posicao}
                  onChange={(e) => setPlayerForm({ ...playerForm, posicao: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
            </div>
            <Button onClick={handleCreatePlayer} className="w-full bg-primary hover:bg-primary-glow text-primary-foreground">
              Adicionar jogador
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
