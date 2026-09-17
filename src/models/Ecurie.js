// Représente une écurie, utilisée par EcurieComposite (pattern Composite bonus)
// pour regrouper plusieurs Pilote.

export class Ecurie {
  constructor({ id, nom, pilotes = [] }) {
    this.id = id;
    this.nom = nom;
    this.pilotes = pilotes; // ids des pilotes de l'écurie
  }
}
