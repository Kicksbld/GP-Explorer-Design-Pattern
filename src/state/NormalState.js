import { PiloteState } from './PiloteState.js';

export class NormalState extends PiloteState {
  get nom() {
    return 'Normal';
  }

  tick(pilote) {
    // TODO
  }
}
