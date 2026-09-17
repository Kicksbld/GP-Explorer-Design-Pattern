// Moteur de course : fait le lien entre State, Observer, Command et Decorator
// sur les Pilote fournis par PiloteDatabase.

import { ClassementSubject } from '../observer/ClassementSubject.js';
import { CourseInvoker } from '../command/CourseInvoker.js';
import { PiloteDatabase } from '../core/PiloteDatabase.js';

export class RaceEngine {
  constructor(pilotes) {
    this.pilotes = pilotes;
    this.classement = new ClassementSubject();
    this.invoker = new CourseInvoker();
    this.tour = 0;
  }

  tourSuivant() {
    this.tour += 1;
    this.pilotes.forEach((p) => p.tick());
    this.#publierClassement();
  }

  executer(command) {
    command.tour = this.tour;
    this.invoker.executer(command);
    this.#publierClassement();
  }

  annulerDerniere() {
    this.invoker.annulerDerniere();
    this.#publierClassement();
  }

  // republie le classement sans avancer le tour, utile après une restauration Memento
  rafraichirClassement() {
    this.#publierClassement();
  }

  // déclenche la technique d'un pilote et remplace la cible dans le tableau
  // si l'effet renvoie une version décorée (ex: MalusEquipementDecorator)
  executerTechnique(pilote, cible) {
    const resultat = pilote.utiliserTechnique(cible);
    if (resultat && cible) {
      this.remplacerPilote(cible, resultat);
    }
    this.#publierClassement();
    return resultat;
  }

  remplacerPilote(ancien, nouveau) {
    const index = this.pilotes.indexOf(ancien);
    if (index !== -1) {
      this.pilotes[index] = nouveau;
    }
  }

  #publierClassement() {
    const db = PiloteDatabase.getInstance();
    const classement = this.pilotes
      .slice()
      .sort((a, b) => b.getVitesse() - a.getVitesse())
      .map((p, index) => ({
        position: index + 1,
        id: p.id,
        pseudo: p.pseudo,
        numero: p.numero,
        image: p.image,
        ecurieNom: db.getEcurieById(p.ecurie)?.nom ?? p.ecurie,
        stateNom: p.state.nom,
      }));

    this.classement.setClassement(classement);
  }
}
