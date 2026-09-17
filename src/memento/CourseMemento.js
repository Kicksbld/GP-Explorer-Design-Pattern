// Pattern: Memento (bonus) — snapshot immuable de l'état d'une course

export class CourseMemento {
  #etat;

  constructor(etat) {
    this.#etat = structuredClone(etat);
  }

  getEtat() {
    return structuredClone(this.#etat);
  }
}
