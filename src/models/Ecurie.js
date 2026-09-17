// Représente une écurie. Sert aussi de "composant" pour le Composite bonus
// (voir src/composite/EcurieComposite.js) qui, lui, agrège plusieurs Pilote.

export class Ecurie {
  constructor({ id, nom, pilotes = [] }) {
    this.id = id;
    this.nom = nom;
    this.pilotes = pilotes; // liste d'ids ou d'instances Pilote selon le stade d'implémentation
  }
}
