// Pattern: Proxy (bonus) — contrôle/valide une action avant de la déléguer
// au véritable sujet (RaceEngine), ex. droit de commissaire de course.

import { UtiliserTechniqueCommand } from '../command/commands/UtiliserTechniqueCommand.js';
import { DepasserCommand } from '../command/commands/DepasserCommand.js';

export class DirectionCourseProxy {
  #verdicts = [];

  constructor(sujetReel) {
    this.sujetReel = sujetReel;
  }

  // Valide la commande puis la délègue au RaceEngine si elle est autorisée.
  // Le verdict (autorisé ou non) est toujours conservé, même en cas de refus,
  // pour alimenter le panneau "Direction de course".
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
