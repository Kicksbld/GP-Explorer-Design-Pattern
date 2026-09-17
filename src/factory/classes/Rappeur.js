import { Pilote } from '../../models/Pilote.js';

export class Rappeur extends Pilote {
  constructor(data) {
    super(data);
    this.stats.vitesse += 7;
    this.stats.controle -= 2;
  }
}
