// Builder : personnalise un pilote étape par étape (stats, technique, équipement)
// indépendamment de la Factory qui elle ne gère que la classe.

import { PiloteFactory } from '../factory/PiloteFactory.js';
import { BonusVitesseDecorator } from '../decorator/decorators/BonusVitesseDecorator.js';
import { MalusEquipementDecorator } from '../decorator/decorators/MalusEquipementDecorator.js';

export class PiloteBuilder {
  #data = { stats: {} };
  #decorateurs = [];

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

  avecImage(image) {
    this.#data.image = image;
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

  avecBonusVitesse(bonus) {
    this.#decorateurs.push((pilote) => new BonusVitesseDecorator(pilote, bonus));
    return this;
  }

  avecMalusEquipement(malus) {
    this.#decorateurs.push((pilote) => new MalusEquipementDecorator(pilote, malus));
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
    const pilote = PiloteFactory.create(this.#data);
    return this.#decorateurs.reduce((courant, decorer) => decorer(courant), pilote);
  }
}
