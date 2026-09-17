import { Pilote } from '../../models/Pilote.js';

// Fonceur : très rapide, moins de contrôle.
export class Rappeur extends Pilote {
  constructor(data) {
    super(data);
    this.stats.vitesse += 2;
    this.stats.controle -= 1;
  }
}
