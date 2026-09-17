import { Pilote } from '../../models/Pilote.js';

export class Streameur extends Pilote {
  constructor(data) {
    super(data);
    this.stats.vitesse -= 2;
    this.stats.endurance = 6;
  }
}
