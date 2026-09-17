// Memento (bonus) : snapshot immuable de l'état d'une course à un instant donné

export class CourseMemento {
  #etat;

  constructor(etat) {
    this.#etat = structuredClone(etat);
  }

  getEtat() {
    return structuredClone(this.#etat);
  }
}
