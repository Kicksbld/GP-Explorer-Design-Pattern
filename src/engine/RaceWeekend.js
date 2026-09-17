// Orchestration des phases du week-end (bonus) : essais, qualifs, course.
// Chaque phase est une session du RaceEngine avec son propre nombre de tours ;
// le résultat des qualifs fixe la grille de départ de la course.

export const PHASES = Object.freeze({
  ESSAIS: 'essais',
  QUALIFS: 'qualifs',
  COURSE: 'course',
});

export const TOURS_PAR_PHASE = Object.freeze({
  [PHASES.ESSAIS]: 3,
  [PHASES.QUALIFS]: 3,
  [PHASES.COURSE]: 12,
});

export const ORDRE_PHASES = Object.freeze([PHASES.ESSAIS, PHASES.QUALIFS, PHASES.COURSE]);

export class RaceWeekend {
  constructor(raceEngine) {
    this.raceEngine = raceEngine;
    this.phase = PHASES.ESSAIS;
    this.resultats = {}; // phase -> ids dans l'ordre du classement final
    this.grille = [];
  }

  demarrer(ordreInitial) {
    this.phase = PHASES.ESSAIS;
    this.raceEngine.demarrerSession({
      phase: this.phase,
      toursTotal: TOURS_PAR_PHASE[this.phase],
      ordreInitial,
    });
  }

  get phaseTerminee() {
    return this.raceEngine.terminee;
  }

  get prochainePhase() {
    return ORDRE_PHASES[ORDRE_PHASES.indexOf(this.phase) + 1] ?? null;
  }

  get termine() {
    return this.phase === PHASES.COURSE && this.raceEngine.terminee;
  }

  // renvoie false tant que la phase en cours n'a pas bouclé tous ses tours
  phaseSuivante() {
    const suivante = this.prochainePhase;
    if (!this.phaseTerminee || !suivante) return false;

    const resultat = [...this.raceEngine.ordre];
    this.resultats[this.phase] = resultat;
    if (this.phase === PHASES.QUALIFS) {
      this.grille = resultat;
    }

    this.phase = suivante;
    this.raceEngine.demarrerSession({
      phase: suivante,
      toursTotal: TOURS_PAR_PHASE[suivante],
      ordreInitial: resultat,
    });
    return true;
  }

  get podium() {
    return this.termine ? this.raceEngine.ordre.slice(0, 3) : [];
  }
}
