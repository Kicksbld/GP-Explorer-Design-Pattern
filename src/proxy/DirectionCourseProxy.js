// Proxy (bonus) : vérifie une action avant de la transmettre au RaceEngine,
// un peu comme un commissaire de course qui valide ou refuse.

import { UtiliserTechniqueCommand } from '../command/commands/UtiliserTechniqueCommand.js';
import { DepasserCommand } from '../command/commands/DepasserCommand.js';
import { AccelererCommand } from '../command/commands/AccelererCommand.js';
import { PasserAuStandCommand } from '../command/commands/PasserAuStandCommand.js';
import { EntrainerCommand } from '../command/commands/EntrainerCommand.js';
import { PHASES } from '../engine/RaceWeekend.js';
import { STAT_MAX } from '../engine/Chronometre.js';

// règlement : quelles actions sont autorisées dans quelle phase du week-end
const PHASES_AUTORISEES = new Map([
  [EntrainerCommand, [PHASES.ESSAIS]],
  [AccelererCommand, [PHASES.QUALIFS, PHASES.COURSE]],
  [UtiliserTechniqueCommand, [PHASES.QUALIFS, PHASES.COURSE]],
  [DepasserCommand, [PHASES.COURSE]],
  [PasserAuStandCommand, [PHASES.COURSE]],
]);

const LIBELLES_PHASE = {
  [PHASES.ESSAIS]: 'essais',
  [PHASES.QUALIFS]: 'qualifs',
  [PHASES.COURSE]: 'course',
};

export class DirectionCourseProxy {
  #verdicts = [];

  constructor(sujetReel) {
    this.sujetReel = sujetReel;
  }

  // vérifie la commande puis la délègue si elle est autorisée, le verdict est
  // gardé dans tous les cas pour le panneau "Direction de course"
  executer(command) {
    const verdict = {
      ...this.#verifier(command),
      commande: command.label,
      piloteId: command.pilote?.id,
      phase: this.sujetReel.phase,
      tour: this.sujetReel.tour,
    };
    this.#verdicts.push(verdict);

    if (!verdict.autorise) {
      throw new Error(verdict.motif);
    }

    return this.sujetReel.executer(command);
  }

  get verdicts() {
    return [...this.#verdicts];
  }

  #verifier(command) {
    const engine = this.sujetReel;
    const { pilote } = command;
    const refus = (motif) => ({ autorise: false, motif });

    if (!engine.pilotes.includes(pilote)) {
      return refus('pilote hors course, action bloquée');
    }

    if (engine.terminee) {
      return refus('session terminée, drapeau à damier');
    }

    const phasesAutorisees = PHASES_AUTORISEES.get(command.constructor) ?? [];
    if (!phasesAutorisees.includes(engine.phase)) {
      return refus(`action interdite pendant les ${LIBELLES_PHASE[engine.phase]}`);
    }

    const commandesDuTour = engine.invoker.historique.filter(
      (c) => c.pilote.id === pilote.id && c.tour === engine.tour,
    );

    if (command instanceof UtiliserTechniqueCommand
      && commandesDuTour.some((c) => c instanceof UtiliserTechniqueCommand)) {
      return refus('technique déjà active ce tour, action bloquée');
    }

    if (commandesDuTour.length > 0) {
      return refus(`une seule action par tour, « ${commandesDuTour[0].label} » déjà jouée`);
    }

    if (command instanceof UtiliserTechniqueCommand
      && pilote.technique?.cible !== 'soi' && !engine.pilotes.includes(command.cible)) {
      return refus('aucun adversaire à portée pour cette technique');
    }

    if (command instanceof DepasserCommand && !engine.pilotes.includes(command.cible)) {
      return refus('piste non dégagée, dépassement refusé');
    }

    if (command instanceof PasserAuStandCommand && pilote.state.nom === 'Normal') {
      return refus('pilote en état Normal, arrêt au stand inutile');
    }

    if (command instanceof AccelererCommand && pilote.stats.vitesse >= STAT_MAX) {
      return refus('vitesse déjà au maximum');
    }

    if (command instanceof EntrainerCommand && pilote.stats[command.stat] >= STAT_MAX) {
      return refus('stat déjà au maximum, entraînement inutile');
    }

    return { autorise: true, motif: 'piste dégagée' };
  }
}
