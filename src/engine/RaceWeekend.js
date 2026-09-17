// Orchestration des phases du week-end (bonus): essais, qualifs, course.

export const PHASES = Object.freeze({
  ESSAIS: 'essais',
  QUALIFS: 'qualifs',
  COURSE: 'course',
});

const ORDRE_PHASES = [PHASES.ESSAIS, PHASES.QUALIFS, PHASES.COURSE];

export class RaceWeekend {
  constructor(raceEngine) {
    this.raceEngine = raceEngine;
    this.phase = PHASES.ESSAIS;
  }

  phaseSuivante() {
    const index = ORDRE_PHASES.indexOf(this.phase);
    if (index < ORDRE_PHASES.length - 1) {
      this.phase = ORDRE_PHASES[index + 1];
    }
  }
}
