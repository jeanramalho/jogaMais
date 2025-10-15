import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { matchService } from "@/services/matchService";
import { teamService } from "@/services/teamService";
import { playerService } from "@/services/playerService";
import { Match, Team, Player, MatchEvent } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Minus, Trophy, Timer } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

/**
 * Página de Detalhes do Jogo
 * Permite gerenciar gols, assistências e finalizar partidas
 */

export default function MatchDetails() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  
  const [match, setMatch] = useState<Match | null>(null);
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);
  const [playersA, setPlayersA] = useState<Player[]>([]);
  const [playersB, setPlayersB] = useState<Player[]>([]);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal de adicionar evento
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    team_id: "",
    player_id: "",
    event_type: "gol" as "gol" | "assist",
    minute: "",
  });

  useEffect(() => {
    if (matchId) {
      loadMatchData();
    }
  }, [matchId]);

  const loadMatchData = async () => {
    if (!matchId) return;
    
    try {
      setLoading(true);
      const matchData = await matchService.getById(matchId);
      
      if (!matchData) {
        toast.error("Jogo não encontrado");
        navigate(-1);
        return;
      }
      
      setMatch(matchData);
      
      // Buscar times
      const [teamAData, teamBData] = await Promise.all([
        teamService.getById(matchData.time_a),
        teamService.getById(matchData.time_b),
      ]);
      
      setTeamA(teamAData);
      setTeamB(teamBData);
      
      // Buscar jogadores dos times
      const [playersAData, playersBData] = await Promise.all([
        playerService.getByTeam(matchData.time_a),
        playerService.getByTeam(matchData.time_b),
      ]);
      
      setPlayersA(playersAData);
      setPlayersB(playersBData);
      
      // Buscar eventos
      const eventsData = await matchService.getMatchEvents(matchId);
      setEvents(eventsData);
      
    } catch (error) {
      console.error("Erro ao carregar dados do jogo:", error);
      toast.error("Erro ao carregar jogo");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!matchId || !eventForm.team_id || !eventForm.player_id) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await matchService.addEvent({
        match_id: matchId,
        team_id: eventForm.team_id,
        player_id: eventForm.player_id,
        event_type: eventForm.event_type,
        minute: eventForm.minute ? parseInt(eventForm.minute) : undefined,
      });
      
      toast.success(
        eventForm.event_type === "gol" ? "Gol registrado!" : "Assistência registrada!"
      );
      
      setEventForm({ team_id: "", player_id: "", event_type: "gol", minute: "" });
      setEventModalOpen(false);
      loadMatchData();
    } catch (error) {
      console.error("Erro ao adicionar evento:", error);
      toast.error("Erro ao registrar evento");
    }
  };

  const handleRemoveEvent = async (eventId: string) => {
    if (!confirm("Deseja remover este evento?")) return;
    
    try {
      await matchService.removeEvent(eventId);
      toast.success("Evento removido");
      loadMatchData();
    } catch (error) {
      console.error("Erro ao remover evento:", error);
      toast.error("Erro ao remover evento");
    }
  };

  const handleFinalizeMatch = async () => {
    if (!matchId) return;
    
    if (!confirm("Deseja finalizar este jogo? Não será possível editar depois.")) {
      return;
    }
    
    try {
      await matchService.finalize(matchId);
      toast.success("Jogo finalizado!");
      loadMatchData();
    } catch (error) {
      console.error("Erro ao finalizar jogo:", error);
      toast.error("Erro ao finalizar jogo");
    }
  };

  const getPlayerName = (playerId: string): string => {
    const player = [...playersA, ...playersB].find(p => p.id === playerId);
    return player ? `${player.nome}${player.numero ? ` (#${player.numero})` : ''}` : "Desconhecido";
  };

  const getTeamGoals = (teamId: string): MatchEvent[] => {
    return events.filter(e => e.team_id === teamId && e.event_type === "gol");
  };

  const getTeamAssists = (teamId: string): MatchEvent[] => {
    return events.filter(e => e.team_id === teamId && e.event_type === "assist");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando jogo...</p>
      </div>
    );
  }

  if (!match || !teamA || !teamB) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Jogo não encontrado</p>
      </div>
    );
  }

  const selectedTeamPlayers = eventForm.team_id === teamA.id ? playersA : playersB;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-display text-foreground">DETALHES DO JOGO</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(match.scheduled_date).toLocaleDateString("pt-BR")} às {match.scheduled_time}
            </p>
          </div>
        </div>

        {/* Placar */}
        <Card className="p-8 bg-card border-border">
          <div className="space-y-6">
            {/* Time A */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex gap-1">
                  <div
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: teamA.color_a }}
                  />
                  {teamA.color_b && (
                    <div
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: teamA.color_b }}
                    />
                  )}
                </div>
                <span className="font-display text-xl text-foreground">{teamA.nome}</span>
              </div>
              <div className="text-4xl font-bold text-primary px-6 py-3 bg-secondary rounded-lg">
                {match.score_a}
              </div>
            </div>

            <Separator />

            {/* Time B */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex gap-1">
                  <div
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: teamB.color_a }}
                  />
                  {teamB.color_b && (
                    <div
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: teamB.color_b }}
                    />
                  )}
                </div>
                <span className="font-display text-xl text-foreground">{teamB.nome}</span>
              </div>
              <div className="text-4xl font-bold text-primary px-6 py-3 bg-secondary rounded-lg">
                {match.score_b}
              </div>
            </div>
          </div>

          {match.finalized && (
            <div className="mt-6 text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent">
                <Trophy className="w-4 h-4" />
                JOGO FINALIZADO
              </span>
            </div>
          )}
        </Card>

        {/* Botões de ação */}
        {!match.finalized && (
          <div className="flex gap-3">
            <Button
              onClick={() => setEventModalOpen(true)}
              className="flex-1 bg-primary hover:bg-primary-glow text-primary-foreground shadow-neon"
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Evento
            </Button>
            <Button
              onClick={handleFinalizeMatch}
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Finalizar Jogo
            </Button>
          </div>
        )}

        {/* Eventos do jogo */}
        <div className="space-y-4">
          <h2 className="text-xl font-display text-foreground">EVENTOS</h2>
          
          {events.length === 0 ? (
            <Card className="p-8 text-center bg-card border-border">
              <Timer className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Nenhum evento registrado ainda</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
                const isTeamA = event.team_id === teamA.id;
                const team = isTeamA ? teamA : teamB;
                
                return (
                  <Card
                    key={event.id}
                    className="p-4 bg-card border-border hover-scale"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex gap-1">
                          <div
                            className="w-3 h-3 rounded-full border border-border"
                            style={{ backgroundColor: team.color_a }}
                          />
                          {team.color_b && (
                            <div
                              className="w-3 h-3 rounded-full border border-border"
                              style={{ backgroundColor: team.color_b }}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {getPlayerName(event.player_id)}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                              {event.event_type === "gol" ? "⚽ GOL" : "🎯 ASSIST"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {team.nome}
                            {event.minute && ` • ${event.minute}'`}
                          </p>
                        </div>
                      </div>
                      
                      {!match.finalized && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveEvent(event.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-card border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">GOLS {teamA.nome}</h3>
            <div className="space-y-2">
              {getTeamGoals(teamA.id).map((event) => (
                <div key={event.id} className="text-sm text-foreground">
                  • {getPlayerName(event.player_id)}
                  {event.minute && ` (${event.minute}')`}
                </div>
              ))}
              {getTeamGoals(teamA.id).length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum gol</p>
              )}
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">GOLS {teamB.nome}</h3>
            <div className="space-y-2">
              {getTeamGoals(teamB.id).map((event) => (
                <div key={event.id} className="text-sm text-foreground">
                  • {getPlayerName(event.player_id)}
                  {event.minute && ` (${event.minute}')`}
                </div>
              ))}
              {getTeamGoals(teamB.id).length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum gol</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de adicionar evento */}
      <Dialog open={eventModalOpen} onOpenChange={setEventModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">ADICIONAR EVENTO</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Evento</Label>
              <Select
                value={eventForm.event_type}
                onValueChange={(v: "gol" | "assist") => setEventForm({ ...eventForm, event_type: v })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gol">⚽ Gol</SelectItem>
                  <SelectItem value="assist">🎯 Assistência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <Select
                value={eventForm.team_id}
                onValueChange={(v) => setEventForm({ ...eventForm, team_id: v, player_id: "" })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Selecione o time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={teamA.id}>{teamA.nome}</SelectItem>
                  <SelectItem value={teamB.id}>{teamB.nome}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {eventForm.team_id && (
              <div className="space-y-2">
                <Label>Jogador</Label>
                <Select
                  value={eventForm.player_id}
                  onValueChange={(v) => setEventForm({ ...eventForm, player_id: v })}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Selecione o jogador" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTeamPlayers.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.nome}
                        {player.numero && ` (#${player.numero})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Minuto (opcional)</Label>
              <Input
                type="number"
                min="0"
                max="120"
                value={eventForm.minute}
                onChange={(e) => setEventForm({ ...eventForm, minute: e.target.value })}
                placeholder="Ex: 45"
                className="bg-secondary border-border"
              />
            </div>

            <Button
              onClick={handleAddEvent}
              className="w-full bg-primary hover:bg-primary-glow text-primary-foreground"
            >
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
