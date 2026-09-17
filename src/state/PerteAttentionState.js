import { PiloteState } from './PiloteState.js';

export class PerteAttentionState extends PiloteState {
  get nom() {
    return 'Perte Attention';
  }

  tick(pilote) {
    // TODO: ex. réduction temporaire de contrôle/vitesse, retour à Normal après N tours
  }
}
