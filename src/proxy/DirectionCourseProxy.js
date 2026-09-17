// Proxy (bonus) : vérifie une action avant de la transmettre au RaceEngine,
// un peu comme un commissaire de course qui valide ou refuse.

import { UtiliserTechniqueCommand } from '../command/commands/UtiliserTechniqueCommand.js';
import { DepasserCommand } from '../command/commands/DepasserCommand.js';

export class DirectionCourseProxy {
  #verdicts = [];

  constructor(sujetReel) {
    this.sujetReel = sujetReel;
  }

  // vérifie la commande puis la délègue si elle est autorisée, le verdict est
  // gardé dans tous les cas pour le panneau "Direction de course"
  executer(command) {
    const verdict = this.#verifier(command);
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
    const commande = command.label;

    if (!this.sujetReel.pilotes.includes(command.pilote)) {
      return { autorise: false, commande, motif: 'pilote hors course, action bloquée' };
    }

    if (command instanceof UtiliserTechniqueCommand) {
      const dejaUtiliseeCeTour = this.sujetReel.invoker.historique.some(
        (c) => c instanceof UtiliserTechniqueCommand
          && c.pilote === command.pilote
          && c.tour === this.sujetReel.tour,
      );
      if (dejaUtiliseeCeTour) {
        return { autorise: false, commande, motif: 'technique déjà active ce tour, action bloquée' };
      }
    }

    if (command instanceof DepasserCommand && !this.sujetReel.pilotes.includes(command.cible)) {
      return { autorise: false, commande, motif: 'piste non dégagée, dépassement refusé' };
    }

    return { autorise: true, commande, motif: 'piste dégagée' };
  }
}
