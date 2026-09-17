import { PiloteState } from './PiloteState.js';
import { NormalState } from './NormalState.js';

export class EpuiseState extends PiloteState {
  get nom() {
    return 'Épuisé';
  }

  getModificateurVitesse() {
    return 0.15;
  }

  tick(pilote) {
    // pénalité maximale, pas de sortie automatique : seul un soin (ex. Rage Clutch) en sort
  }

  recevoirEffet(pilote, effet) {
    if (effet === 'soin') {
      pilote.setState(new NormalState());
    }
  }
}
