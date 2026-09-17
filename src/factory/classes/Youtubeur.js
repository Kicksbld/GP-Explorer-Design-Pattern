import { Pilote } from '../../models/Pilote.js';

export class Youtubeur extends Pilote {
  constructor(data) {
    super(data);
    this.stats.vitesse += 3;
    this.stats.controle += 3;
  }
}
