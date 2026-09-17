// Pattern: Observer
// Sujet observable — notifie les spectateurs à chaque changement de classement.

export class ClassementSubject {
  #observers = new Set();
  #classement = [];

  subscribe(observer) {
    this.#observers.add(observer);
  }

  unsubscribe(observer) {
    this.#observers.delete(observer);
  }

  setClassement(nouveauClassement) {
    this.#classement = nouveauClassement;
    this.#notifier();
  }

  #notifier() {
    for (const observer of this.#observers) {
      observer.update(this.#classement);
    }
  }
}
