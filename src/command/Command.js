// Pattern: Command (bonus) — interface pour les actions de course

export class Command {
  execute() {
    throw new Error('execute() non implémenté');
  }

  undo() {
    throw new Error('undo() non implémenté');
  }
}
