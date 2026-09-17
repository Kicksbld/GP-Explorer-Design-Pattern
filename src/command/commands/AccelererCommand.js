import { Command } from '../Command.js';

const BONUS_VITESSE = 2;

export class AccelererCommand extends Command {
  constructor(pilote) {
    super();
    this.pilote = pilote;
  }

  execute() {
    this.pilote.stats.vitesse += BONUS_VITESSE;
  }

  undo() {
    this.pilote.stats.vitesse -= BONUS_VITESSE;
  }

  get label() {
    return 'Accélérer';
  }
}
