import { PiloteState } from './PiloteState.js';
import { EpuiseState } from './EpuiseState.js';
import { NormalState } from './NormalState.js';

const TOURS_AVANT_EPUISEMENT = 3;

export class FatigueState extends PiloteState {
  #tours;

  // `tours` permet au Memento de restaurer un état avec son compteur exact
  constructor(tours = 0) {
    super();
    this.#tours = tours;
  }

  get nom() {
    return 'Fatigué';
  }

  get tours() {
    return this.#tours;
  }

  getModificateurVitesse() {
    return 0.6;
  }

  tick(pilote) {
    this.#tours += 1;
    if (this.#tours >= TOURS_AVANT_EPUISEMENT) {
      pilote.setState(new EpuiseState());
    }
  }

  recevoirEffet(pilote, effet) {
    if (effet === 'soin') {
      pilote.setState(new NormalState());
    }
  }
}
