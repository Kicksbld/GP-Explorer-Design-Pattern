// ex: "Sale Coup Fourré" (Théodort), "Robot Sabotage" (Michael Reeves)

import { PiloteDecorator } from '../PiloteDecorator.js';

export class MalusEquipementDecorator extends PiloteDecorator {
  constructor(pilote, malus = 0) {
    super(pilote);
    this.malus = malus;
  }

  getVitesse() {
    return Math.max(0, super.getVitesse() - this.malus);
  }
}
