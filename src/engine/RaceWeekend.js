// Orchestration des phases du week-end (bonus): essais, qualifs, course.

export const PHASES = Object.freeze({
  ESSAIS: 'essais',
  QUALIFS: 'qualifs',
  COURSE: 'course',
});

export class RaceWeekend {
  constructor(raceEngine) {
    this.raceEngine = raceEngine;
    this.phase = PHASES.ESSAIS;
  }

  phaseSuivante() {
    // TODO: ESSAIS -> QUALIFS -> COURSE
  }
}
