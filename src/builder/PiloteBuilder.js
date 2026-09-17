// Pattern: Builder
// Personnalise un pilote (stats custom, technique modifiée, équipement de départ)
// étape par étape, indépendamment de la Factory qui gère juste la classe.

import { PiloteFactory } from '../factory/PiloteFactory.js';

export class PiloteBuilder {
  #data = { stats: {} };

  avecIdentite(id, pseudo, numero) {
    this.#data.id = id;
    this.#data.pseudo = pseudo;
    this.#data.numero = numero;
    return this;
  }

  avecClasse(classe) {
    this.#data.classe = classe;
    return this;
  }

  avecEcurie(ecurieId) {
    this.#data.ecurie = ecurieId;
    return this;
  }

  avecTechnique(technique) {
    this.#data.technique = technique;
    return this;
  }

  avecStat(nom, valeur) {
    this.#data.stats[nom] = valeur;
    return this;
  }

  build() {
    if (!this.#data.id) {
      throw new Error('PiloteBuilder: id manquant (avecIdentite)');
    }
    if (!this.#data.pseudo) {
      throw new Error('PiloteBuilder: pseudo manquant (avecIdentite)');
    }
    if (!this.#data.classe) {
      throw new Error('PiloteBuilder: classe manquante (avecClasse)');
    }
    return PiloteFactory.create(this.#data);
  }
}
