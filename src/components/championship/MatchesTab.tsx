import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { matchService } from "@/services/matchService";
import { teamService } from "@/services/teamService";
import { Match, Team, Championship } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Aba de Jogos
 * Gerencia criação e visualização de partidas
 */

interface MatchesTabProps {
  championshipId: string;
  championship: Championship;
}

export default function MatchesTab({ championshipId, championship }: MatchesTabProps) {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const [matchForm, setMatchForm] = useState({
    time_a: "",
    time_b: "",
    type: "grupo",
    scheduled_date: "",
    scheduled_time: "",
  });

  useEffect(() => {
    loadData();
  }, [championshipId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matchesData, teamsData] = await Promise.all([
        matchService.getByChampionship(championshipId),
        teamService.getByChampionship(championshipId),
      ]);
      setMatches(matchesData);
      setTeams(teamsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar jogos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async () => {
    if (!matchForm.time_a || !matchForm.time_b || !matchForm.scheduled_date || !matchForm.scheduled_time) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (matchForm.time_a === matchForm.time_b) {
      toast.error("Selecione times diferentes");
      return;
    }

    try {
      await matchService.create({
        championship_id: championshipId,
        time_a: matchForm.time_a,
        time_b: matchForm.time_b,
        type: matchForm.type,
        scheduled_date: matchForm.scheduled_date,
        scheduled_time: matchForm.scheduled_time,
      });
      toast.success("Jogo criado com sucesso!");
      setMatchForm({ time_a: "", time_b: "", type: "grupo", scheduled_date: "", scheduled_time: "" });
      setModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Erro ao criar jogo:", error);
      toast.error("Erro ao criar jogo");
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm("Tem certeza que deseja excluir este jogo?")) {
      return;
    }

    try {
      await matchService.delete(matchId);
      toast.success("Jogo excluído com sucesso!");
      loadData();
    } catch (error) {
      console.error("Erro ao excluir jogo:", error);
      toast.error("Erro ao excluir jogo");
    }
  };

  // Agrupa jogos por data (corrigindo timezone)
  const matchesByDate = matches.reduce((acc, match) => {
    const date = match.scheduled_date.split('T')[0].split('-').reverse().join('/');
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  const dates = Object.keys(matchesByDate).sort();
  const displayedMatches = selectedDate ? matchesByDate[selectedDate] : matches;

  const getTeamById = (id: string) => teams.find((t) => t.id === id);
  const isFinalized = championship.status === "finalized";

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando jogos...</div>;
  }

  if (teams.length < 2) {
    return (
      <Card className="p-12 text-center bg-card border-border">
        <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Crie pelo menos 2 times antes de criar jogos</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <h3 className="text-2xl font-display text-foreground">JOGOS</h3>
          {dates.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedDate === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDate(null)}
                className="text-xs"
              >
                Todos
              </Button>
              {dates.map((date) => (
                <Button
                  key={date}
                  variant={selectedDate === date ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDate(date)}
                  className="text-xs"
                >
                  {date}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        {!isFinalized && (
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-glow text-primary-foreground shadow-neon">
                <Plus className="w-5 h-5 mr-2" />
                Novo Jogo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">CRIAR JOGO</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Time A</Label>
                  <Select value={matchForm.time_a} onValueChange={(v) => setMatchForm({ ...matchForm, time_a: v })}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Selecione o time" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>{team.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Time B</Label>
                  <Select value={matchForm.time_b} onValueChange={(v) => setMatchForm({ ...matchForm, time_b: v })}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Selecione o time" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>{team.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo/Fase</Label>
                  <Select value={matchForm.type} onValueChange={(v) => setMatchForm({ ...matchForm, type: v })}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grupo">Fase de Grupo</SelectItem>
                      <SelectItem value="oitavas">Oitavas</SelectItem>
                      <SelectItem value="quartas">Quartas</SelectItem>
                      <SelectItem value="semi">Semifinal</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={matchForm.scheduled_date}
                      onChange={(e) => setMatchForm({ ...matchForm, scheduled_date: e.target.value })}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora</Label>
                    <Input
                      type="time"
                      value={matchForm.scheduled_time}
                      onChange={(e) => setMatchForm({ ...matchForm, scheduled_time: e.target.value })}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <Button onClick={handleCreateMatch} className="w-full bg-primary hover:bg-primary-glow text-primary-foreground">
                  Criar jogo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Lista de jogos */}
      {displayedMatches.length === 0 ? (
        <Card className="p-12 text-center bg-card border-border">
          <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum jogo agendado ainda</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayedMatches.map((match) => {
            const teamA = getTeamById(match.time_a);
            const teamB = getTeamById(match.time_b);
            
            return (
              <Card
                key={match.id}
                className="p-6 card-joga hover-scale relative"
              >
                {!isFinalized && !match.finalized && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMatch(match.id);
                    }}
                    className="absolute top-2 right-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                
                <div 
                  className="space-y-3 cursor-pointer"
                  onClick={() => navigate(`/match/${match.id}`)}
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground pr-8">
                    <span>{match.type}</span>
                    <span>
                      {match.scheduled_date.split('T')[0].split('-').reverse().join('/')} às{" "}
                      {match.scheduled_time}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex gap-1">
                        <div
                          className="w-3 h-3 rounded-full border border-border"
                          style={{ backgroundColor: teamA?.color_a }}
                        />
                        {teamA?.color_b && (
                          <div
                            className="w-3 h-3 rounded-full border border-border"
                            style={{ backgroundColor: teamA.color_b }}
                          />
                        )}
                      </div>
                      <span className="font-display text-foreground">{teamA?.nome}</span>
                    </div>
                    <div className="px-4 py-2 bg-secondary rounded font-bold text-lg">
                      {match.score_a}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex gap-1">
                        <div
                          className="w-3 h-3 rounded-full border border-border"
                          style={{ backgroundColor: teamB?.color_a }}
                        />
                        {teamB?.color_b && (
                          <div
                            className="w-3 h-3 rounded-full border border-border"
                            style={{ backgroundColor: teamB.color_b }}
                          />
                        )}
                      </div>
                      <span className="font-display text-foreground">{teamB?.nome}</span>
                    </div>
                    <div className="px-4 py-2 bg-secondary rounded font-bold text-lg">
                      {match.score_b}
                    </div>
                  </div>

                  {match.finalized && (
                    <div className="text-center">
                      <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent">
                        FINALIZADO
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
