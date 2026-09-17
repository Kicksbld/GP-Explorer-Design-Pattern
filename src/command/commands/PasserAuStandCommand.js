import { Command } from '../Command.js';
import { PENALITE_STAND } from '../../engine/Chronometre.js';

// Arrêt au stand : soigne l'état du pilote (State) contre une pénalité de temps
// que le RaceEngine ajoute au tour en cours.
export class PasserAuStandCommand extends Command {
  #etatAvant = null;

  constructor(engine, pilote) {
    super();
    this.engine = engine;
    this.pilote = pilote;
  }

  execute() {
    this.#etatAvant = this.pilote.state;
    this.pilote.state.recevoirEffet(this.pilote, 'soin');
    this.engine.ajouterPenalite(this.pilote.id, PENALITE_STAND);
  }

  undo() {
    if (!this.#etatAvant) return;
    this.pilote.setState(this.#etatAvant);
    this.engine.retirerPenalite(this.pilote.id, PENALITE_STAND);
  }

  get label() {
    return 'Passer au stand';
  }
}
