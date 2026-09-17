import { PiloteState } from './PiloteState.js';
import { NormalState } from './NormalState.js';

const DUREE_TOURS = 1;

export class PerteAttentionState extends PiloteState {
  #tours;

  // `tours` permet au Memento de restaurer un état avec son compteur exact
  constructor(tours = 0) {
    super();
    this.#tours = tours;
  }

  get nom() {
    return 'Perte Attention';
  }

  get tours() {
    return this.#tours;
  }

  getModificateurVitesse() {
    return 0.3;
  }

  tick(pilote) {
    this.#tours += 1;
    if (this.#tours >= DUREE_TOURS) {
      pilote.setState(new NormalState());
    }
  }

  recevoirEffet(pilote, effet) {
    if (effet === 'soin') {
      pilote.setState(new NormalState());
    }
  }
}
