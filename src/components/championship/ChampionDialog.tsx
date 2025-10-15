import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Team } from "@/types/models";
import { Trophy } from "lucide-react";

/**
 * Dialog para selecionar o time campeão ao finalizar campeonato
 */

interface ChampionDialogProps {
  open: boolean;
  teams: Team[];
  onConfirm: (championId: string) => void;
  onCancel: () => void;
}

export default function ChampionDialog({ open, teams, onConfirm, onCancel }: ChampionDialogProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");

  const handleConfirm = () => {
    if (!selectedTeamId) {
      return;
    }
    onConfirm(selectedTeamId);
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground font-display text-2xl">
            <Trophy className="w-6 h-6 text-primary" />
            DEFINIR CAMPEÃO
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Selecione o time campeão do campeonato. Esta ação finalizará o campeonato e impedirá futuras edições.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <Label className="text-foreground font-semibold">Time Campeão</Label>
          <div className="space-y-2">
            {teams.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Nenhum time cadastrado no campeonato</p>
            ) : (
              teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`w-full p-3 rounded-lg border flex items-center justify-between transition-all ${
                    selectedTeamId === team.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary hover:bg-secondary/80"
                  }`}
                >
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
                    <span className="text-foreground font-medium">{team.nome}</span>
                  </div>
                  {selectedTeamId === team.id && (
                    <Trophy className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} className="bg-secondary text-foreground hover:bg-secondary/80">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!selectedTeamId}
            className="bg-primary hover:bg-primary-glow text-primary-foreground"
          >
            Finalizar campeonato
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
