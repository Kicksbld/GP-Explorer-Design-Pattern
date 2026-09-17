import { Pilote } from '../../models/Pilote.js';

// Régulier : un peu moins rapide, mais bien plus de contrôle.
export class Streameur extends Pilote {
  constructor(data) {
    super(data);
    this.stats.vitesse -= 1;
    this.stats.controle += 3;
    this.stats.endurance = 6;
  }
}
