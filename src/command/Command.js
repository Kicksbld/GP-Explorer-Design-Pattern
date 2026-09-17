// Pattern: Command (bonus) — interface pour les actions de course

export class Command {
  execute() {
    throw new Error('execute() non implémenté');
  }

  undo() {
    throw new Error('undo() non implémenté');
  }

  // Libellé affiché dans l'historique des commandes (UI) — chaque sous-classe le précise.
  get label() {
    return 'Commande';
  }
}
