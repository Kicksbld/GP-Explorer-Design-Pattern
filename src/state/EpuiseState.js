import { PiloteState } from './PiloteState.js';

export class EpuiseState extends PiloteState {
  get nom() {
    return 'Épuisé';
  }

  tick(pilote) {
    // TODO: pénalité forte, ex. seule une technique spécifique (Rage Clutch) permet de s'en sortir
  }
}
