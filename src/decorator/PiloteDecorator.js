// Pattern: Decorator — base pour ajouter dynamiquement bonus/malus/équipements
// à un Pilote sans toucher à sa classe.

export class PiloteDecorator {
  constructor(pilote) {
    this.pilote = pilote;
  }

  get id() {
    return this.pilote.id;
  }

  get pseudo() {
    return this.pilote.pseudo;
  }

  getVitesse() {
    return this.pilote.getVitesse();
  }

  tick() {
    this.pilote.tick();
  }
}
