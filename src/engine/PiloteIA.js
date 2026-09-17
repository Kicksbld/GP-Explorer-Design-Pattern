// IA des pilotes que le joueur ne contrôle pas : propose au plus une Command
// par tour selon la phase et l'état du pilote. La commande passe ensuite par la
// Direction de course (Proxy), exactement comme une action du joueur.

import { PHASES } from './RaceWeekend.js';
import { TECHNIQUES_SOIN, techniqueSoigne } from '../models/Pilote.js';
import { AccelererCommand } from '../command/commands/AccelererCommand.js';
import { EntrainerCommand } from '../command/commands/EntrainerCommand.js';
import { PasserAuStandCommand } from '../command/commands/PasserAuStandCommand.js';
import { UtiliserTechniqueCommand } from '../command/commands/UtiliserTechniqueCommand.js';

const CHANCE_ENTRAINEMENT = 0.7;
const CHANCE_TECHNIQUE_QUALIFS = 0.25;
const CHANCE_ACCELERER_QUALIFS = 0.2;
const CHANCE_STAND_FATIGUE = 0.35;
const CHANCE_TECHNIQUE_COURSE = 0.2;
const CHANCE_ACCELERER_COURSE = 0.1;

export class PiloteIA {
  constructor(engine, aleatoire = Math.random) {
    this.engine = engine;
    this.aleatoire = aleatoire;
  }

  deciderAction(pilote) {
    const hasard = this.aleatoire();

    switch (this.engine.phase) {
      case PHASES.ESSAIS:
        return hasard < CHANCE_ENTRAINEMENT ? this.#entrainement(pilote) : null;

      case PHASES.QUALIFS:
        if (hasard < CHANCE_TECHNIQUE_QUALIFS) return this.#techniqueOffensive(pilote);
        if (hasard < CHANCE_TECHNIQUE_QUALIFS + CHANCE_ACCELERER_QUALIFS) return new AccelererCommand(pilote);
        return null;

      case PHASES.COURSE:
        return this.#decisionCourse(pilote, hasard);

      default:
        return null;
    }
  }

  // travaille sa stat la plus faible
  #entrainement(pilote) {
    const stat = pilote.stats.vitesse <= pilote.stats.controle ? 'vitesse' : 'controle';
    return new EntrainerCommand(pilote, stat);
  }

  #decisionCourse(pilote, hasard) {
    const etat = pilote.state.nom;

    if (etat === 'Épuisé' || (etat === 'Fatigué' && hasard < CHANCE_STAND_FATIGUE)) {
      return techniqueSoigne(pilote)
        ? new UtiliserTechniqueCommand(this.engine, pilote, null)
        : new PasserAuStandCommand(this.engine, pilote);
    }

    if (hasard < CHANCE_TECHNIQUE_COURSE) return this.#techniqueOffensive(pilote);
    if (hasard < CHANCE_TECHNIQUE_COURSE + CHANCE_ACCELERER_COURSE) return new AccelererCommand(pilote);
    return null;
  }

  // les techniques de soin sont gardées pour quand le pilote en a besoin
  #techniqueOffensive(pilote) {
    const { technique } = pilote;
    if (!technique || TECHNIQUES_SOIN.has(technique.nom)) return null;

    const cible = this.engine.cibleTechnique(pilote);
    if (technique.cible !== 'soi' && !cible) return null;
    return new UtiliserTechniqueCommand(this.engine, pilote, cible);
  }
}
