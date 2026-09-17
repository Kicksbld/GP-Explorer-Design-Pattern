import { PiloteState } from './PiloteState.js';

export class FatigueState extends PiloteState {
  get nom() {
    return 'Fatigué';
  }

  tick(pilote) {
    // TODO: risque de transition vers EpuiseState si rien ne le soigne
  }
}
