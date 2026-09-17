// Pattern: Proxy (bonus) — contrôle/valide une action avant de la déléguer
// au véritable sujet (ex: RaceEngine ou une Command), ex. droit de commissaire de course.

export class DirectionCourseProxy {
  constructor(sujetReel) {
    this.sujetReel = sujetReel;
  }

  executerCommand(command, auteur) {
    // TODO: vérifier les droits/règles avant de déléguer
    if (!this.#estAutorise(auteur)) {
      throw new Error(`${auteur} n'est pas autorisé à exécuter cette action`);
    }
    return this.sujetReel.executer(command);
  }

  #estAutorise(auteur) {
    // TODO
    return true;
  }
}
