// Pattern: Command (bonus) — invoker: file d'exécution + historique/undo

export class CourseInvoker {
  #historique = [];

  executer(command) {
    command.execute();
    this.#historique.push(command);
  }

  annulerDerniere() {
    const command = this.#historique.pop();
    command?.undo();
  }

  get historique() {
    return [...this.#historique];
  }
}
