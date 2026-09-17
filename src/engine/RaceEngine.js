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
}
