import { Command } from '../Command.js';

export class DepasserCommand extends Command {
  constructor(pilote, cible) {
    super();
    this.pilote = pilote;
    this.cible = cible;
  }

  execute() {
    // TODO
  }

  undo() {
    // TODO
  }
}
