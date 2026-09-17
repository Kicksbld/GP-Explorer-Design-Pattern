// Moteur de course — fait interagir State, Observer, Command et Decorator
// sur les Pilote fournis par PiloteDatabase.

import { ClassementSubject } from '../observer/ClassementSubject.js';
import { CourseInvoker } from '../command/CourseInvoker.js';

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
    // TODO: recalculer l'ordre et pousser via this.classement.setClassement(...)
  }

  executer(command) {
    this.invoker.executer(command);
  }

  // Déclenche la technique d'un pilote. Si l'effet renvoie un pilote décoré
  // (ex: MalusEquipementDecorator sur la cible), on le substitue dans le
  // tableau pour que le reste du moteur (classement, ticks...) utilise
  // désormais la version décorée.
  executerTechnique(pilote, cible) {
    const resultat = pilote.utiliserTechnique(cible);
    if (resultat && cible) {
      this.remplacerPilote(cible, resultat);
    }
    return resultat;
  }

  remplacerPilote(ancien, nouveau) {
    const index = this.pilotes.indexOf(ancien);
    if (index !== -1) {
      this.pilotes[index] = nouveau;
    }
  }
}
