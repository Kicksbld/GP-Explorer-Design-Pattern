// Pattern: Memento (bonus) — caretaker: historique de sauvegardes

import { CourseMemento } from './CourseMemento.js';

export class CourseCaretaker {
  #historique = [];

  sauvegarder(etat) {
    this.#historique.push(new CourseMemento(etat));
  }

  restaurer(index = this.#historique.length - 1) {
    return this.#historique[index]?.getEtat();
  }
}
