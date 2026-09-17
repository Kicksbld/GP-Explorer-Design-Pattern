import { Pilote } from '../../models/Pilote.js';

// Polyvalent : léger bonus partout.
export class Youtubeur extends Pilote {
  constructor(data) {
    super(data);
    this.stats.vitesse += 1;
    this.stats.controle += 1;
  }
}
