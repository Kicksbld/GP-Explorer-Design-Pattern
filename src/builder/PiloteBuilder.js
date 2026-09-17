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
    // TODO: validations avant de déléguer la construction à la Factory
    return PiloteFactory.create(this.#data);
  }
}
