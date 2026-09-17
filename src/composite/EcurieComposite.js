// Pattern: Composite (bonus) — une écurie agrège des Pilote et expose
// la même interface qu'un pilote unique (stats agrégées, tick global).

export class EcurieComposite {
  constructor(ecurie) {
    this.ecurie = ecurie;
    this.pilotes = [];
  }

  ajouter(pilote) {
    this.pilotes.push(pilote);
  }

  retirer(pilote) {
    this.pilotes = this.pilotes.filter((p) => p !== pilote);
  }

  tick() {
    this.pilotes.forEach((p) => p.tick());
  }

  getVitesseMoyenne() {
    if (this.pilotes.length === 0) return 0;
    const total = this.pilotes.reduce((somme, pilote) => somme + pilote.getVitesse(), 0);
    return total / this.pilotes.length;
  }
}
