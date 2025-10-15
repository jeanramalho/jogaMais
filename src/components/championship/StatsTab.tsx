import { useEffect, useState } from "react";
import { playerService } from "@/services/playerService";
import { matchService } from "@/services/matchService";
import { teamService } from "@/services/teamService";
import { Player, Match, Team } from "@/types/models";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Target, Users } from "lucide-react";

/**
 * Aba de Estatísticas
 * Exibe artilharia, assistências e classificação
 */

interface StatsTabProps {
  championshipId: string;
}

interface TeamStats {
  team: Team;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldo: number;
  pontos: number;
}

export default function StatsTab({ championshipId }: StatsTabProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [classification, setClassification] = useState<TeamStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [championshipId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Carrega jogadores para artilharia e assistências
      const playersData = await playerService.getByChampionship(championshipId);
      setPlayers(playersData);

      // Carrega times e partidas para classificação
      const [teams, matches] = await Promise.all([
        teamService.getByChampionship(championshipId),
        matchService.getByChampionship(championshipId),
      ]);

      // Calcula classificação apenas com jogos finalizados
      const finalizedMatches = matches.filter((m) => m.finalized);
      const stats: Record<string, TeamStats> = {};

      // Inicializa estatísticas de cada time
      teams.forEach((team) => {
        stats[team.id] = {
          team,
          jogos: 0,
          vitorias: 0,
          empates: 0,
          derrotas: 0,
          golsPro: 0,
          golsContra: 0,
          saldo: 0,
          pontos: 0,
        };
      });

      // Processa cada partida finalizada
      finalizedMatches.forEach((match) => {
        const teamA = stats[match.time_a];
        const teamB = stats[match.time_b];

        if (!teamA || !teamB) return;

        teamA.jogos++;
        teamB.jogos++;
        teamA.golsPro += match.score_a;
        teamA.golsContra += match.score_b;
        teamB.golsPro += match.score_b;
        teamB.golsContra += match.score_a;

        if (match.score_a > match.score_b) {
          teamA.vitorias++;
          teamA.pontos += 3;
          teamB.derrotas++;
        } else if (match.score_b > match.score_a) {
          teamB.vitorias++;
          teamB.pontos += 3;
          teamA.derrotas++;
        } else {
          teamA.empates++;
          teamB.empates++;
          teamA.pontos += 1;
          teamB.pontos += 1;
        }
      });

      // Calcula saldo e ordena
      const classificationData = Object.values(stats).map((stat) => ({
        ...stat,
        saldo: stat.golsPro - stat.golsContra,
      }));

      classificationData.sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
        if (b.saldo !== a.saldo) return b.saldo - a.saldo;
        return b.golsPro - a.golsPro;
      });

      setClassification(classificationData);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const topScorers = [...players]
    .filter((p) => p.total_gols > 0)
    .sort((a, b) => b.total_gols - a.total_gols)
    .slice(0, 10);

  const topAssists = [...players]
    .filter((p) => p.total_assists > 0)
    .sort((a, b) => b.total_assists - a.total_assists)
    .slice(0, 10);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando estatísticas...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-display text-foreground">ESTATÍSTICAS</h3>

      {/* Artilharia */}
      <Card className="p-6 bg-card border-border card-joga">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h4 className="text-xl font-display text-foreground">ARTILHARIA</h4>
        </div>
        {topScorers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum gol marcado ainda</p>
        ) : (
          <div className="space-y-2">
            {topScorers.map((player, idx) => (
              <div key={player.id} className="flex items-center justify-between p-2 bg-secondary rounded">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary w-6">{idx + 1}º</span>
                  <span className="text-sm text-foreground">{player.nome}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{player.total_gols} gols</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Assistências */}
      <Card className="p-6 bg-card border-border card-joga">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h4 className="text-xl font-display text-foreground">ASSISTÊNCIAS</h4>
        </div>
        {topAssists.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma assistência registrada ainda</p>
        ) : (
          <div className="space-y-2">
            {topAssists.map((player, idx) => (
              <div key={player.id} className="flex items-center justify-between p-2 bg-secondary rounded">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary w-6">{idx + 1}º</span>
                  <span className="text-sm text-foreground">{player.nome}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{player.total_assists} assistências</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Classificação */}
      <Card className="p-6 bg-card border-border card-joga">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <h4 className="text-xl font-display text-foreground">CLASSIFICAÇÃO</h4>
        </div>
        {classification.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum jogo finalizado ainda</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Pos</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-center font-bold">Pts</TableHead>
                  <TableHead className="text-center">J</TableHead>
                  <TableHead className="text-center">V</TableHead>
                  <TableHead className="text-center">E</TableHead>
                  <TableHead className="text-center">D</TableHead>
                  <TableHead className="text-center">GP</TableHead>
                  <TableHead className="text-center">GC</TableHead>
                  <TableHead className="text-center">SG</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classification.map((stat, idx) => (
                  <TableRow key={stat.team.id}>
                    <TableCell className="font-bold text-primary">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div
                            className="w-3 h-3 rounded-full border border-border"
                            style={{ backgroundColor: stat.team.color_a }}
                          />
                          {stat.team.color_b && (
                            <div
                              className="w-3 h-3 rounded-full border border-border"
                              style={{ backgroundColor: stat.team.color_b }}
                            />
                          )}
                        </div>
                        <span className="text-sm">{stat.team.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold">{stat.pontos}</TableCell>
                    <TableCell className="text-center">{stat.jogos}</TableCell>
                    <TableCell className="text-center">{stat.vitorias}</TableCell>
                    <TableCell className="text-center">{stat.empates}</TableCell>
                    <TableCell className="text-center">{stat.derrotas}</TableCell>
                    <TableCell className="text-center">{stat.golsPro}</TableCell>
                    <TableCell className="text-center">{stat.golsContra}</TableCell>
                    <TableCell className="text-center">{stat.saldo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
