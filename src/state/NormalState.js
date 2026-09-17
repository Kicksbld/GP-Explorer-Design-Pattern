import { PiloteState } from './PiloteState.js';
import { FatigueState } from './FatigueState.js';
import { PerteAttentionState } from './PerteAttentionState.js';

const TOURS_AVANT_FATIGUE = 6;

export class NormalState extends PiloteState {
  #tours = 0;

  get nom() {
    return 'Normal';
  }

  tick(pilote) {
    this.#tours += 1;
    if (this.#tours >= TOURS_AVANT_FATIGUE) {
      pilote.setState(new FatigueState());
    }
  }

  recevoirEffet(pilote, effet) {
    if (effet === 'perte-attention') {
      pilote.setState(new PerteAttentionState());
    } else if (effet === 'fatigue') {
      pilote.setState(new FatigueState());
    }
  }
}
