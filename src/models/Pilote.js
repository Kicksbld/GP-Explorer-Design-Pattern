// Entité de base — étendue par les classes Factory (Youtubeur, Streameur, Rappeur)
// et enveloppée par les Decorator (bonus/malus).

import { NormalState } from '../state/NormalState.js';

export class Pilote {
  constructor({ id, pseudo, numero, ecurie, classe, technique, stats = {} }) {
    this.id = id;
    this.pseudo = pseudo;
    this.numero = numero;
    this.ecurie = ecurie;
    this.classe = classe;
    this.technique = technique;
    this.stats = { vitesse: 1, controle: 1, ...stats };
    this.state = new NormalState();
  }

  setState(state) {
    this.state = state;
  }

  tick() {
    // TODO: délègue au State courant (Normal / PerteAttention / Fatigue / Epuise)
    this.state.tick(this);
  }

  utiliserTechnique(cible) {
    // TODO: applique l'effet de this.technique (souvent via un changement de State ou un Decorator)
  }

  getVitesse() {
    return Math.max(0, this.stats.vitesse);
  }

  getControle() {
    return Math.max(0, this.stats.controle);
  }
}
