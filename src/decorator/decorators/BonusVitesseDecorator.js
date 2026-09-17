import { PiloteDecorator } from '../PiloteDecorator.js';

export class BonusVitesseDecorator extends PiloteDecorator {
  constructor(pilote, bonus = 0) {
    super(pilote);
    this.bonus = bonus;
  }

  getVitesse() {
    return super.getVitesse() + this.bonus;
  }
}
