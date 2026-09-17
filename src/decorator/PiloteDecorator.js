// Decorator : classe de base pour ajouter des bonus/malus à un Pilote
// sans toucher à sa classe d'origine.

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

  get numero() {
    return this.pilote.numero;
  }

  get ecurie() {
    return this.pilote.ecurie;
  }

  get classe() {
    return this.pilote.classe;
  }

  get technique() {
    return this.pilote.technique;
  }

  get image() {
    return this.pilote.image;
  }

  get state() {
    return this.pilote.state;
  }

  get stats() {
    return this.pilote.stats;
  }

  setState(state) {
    this.pilote.setState(state);
  }

  // renvoie le résultat : une technique de malus rend la cible décorée
  utiliserTechnique(cible) {
    return this.pilote.utiliserTechnique(cible);
  }

  getVitesse() {
    return this.pilote.getVitesse();
  }

  getControle() {
    return this.pilote.getControle();
  }

  tick() {
    this.pilote.tick();
  }
}
