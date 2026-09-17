import { Command } from '../Command.js';

// Entraînement pendant les essais : le pilote progresse d'un point dans une stat.
const STATS = { vitesse: 'vitesse', controle: 'contrôle' };

export class EntrainerCommand extends Command {
  constructor(pilote, stat) {
    super();
    if (!STATS[stat]) {
      throw new Error(`Stat d'entraînement inconnue: ${stat}`);
    }
    this.pilote = pilote;
    this.stat = stat;
  }

  execute() {
    this.pilote.stats[this.stat] += 1;
  }

  undo() {
    this.pilote.stats[this.stat] -= 1;
  }

  get label() {
    return `Entraînement ${STATS[this.stat]}`;
  }
}
