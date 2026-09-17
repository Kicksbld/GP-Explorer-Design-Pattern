import { Command } from '../Command.js';

export class UtiliserTechniqueCommand extends Command {
  constructor(pilote, cible = null) {
    super();
    this.pilote = pilote;
    this.cible = cible;
  }

  execute() {
    // TODO: this.pilote.utiliserTechnique(this.cible)
  }

  undo() {
    // TODO
  }
}
