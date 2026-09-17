import { Command } from '../Command.js';

// Manœuvre risquée : gain de vitesse au prix d'un peu de contrôle.
const BONUS_VITESSE = 3;
const MALUS_CONTROLE = 1;

export class DepasserCommand extends Command {
  constructor(pilote, cible) {
    super();
    this.pilote = pilote;
    this.cible = cible;
  }

  execute() {
    this.pilote.stats.vitesse += BONUS_VITESSE;
    this.pilote.stats.controle -= MALUS_CONTROLE;
  }

  undo() {
    this.pilote.stats.vitesse -= BONUS_VITESSE;
    this.pilote.stats.controle += MALUS_CONTROLE;
  }

  get label() {
    return this.cible ? `Dépasser ${this.cible.pseudo}` : 'Dépasser';
  }
}
