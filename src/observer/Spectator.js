// Pattern: Observer — observer concret

export class Spectator {
  constructor(nom) {
    this.nom = nom;
  }

  update(classement) {
    // TODO: réagir au nouveau classement (affichage console/DOM)
  }
}
