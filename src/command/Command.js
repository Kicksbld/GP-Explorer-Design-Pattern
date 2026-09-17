// Command (bonus) : interface commune pour les actions de course

export class Command {
  execute() {
    throw new Error('execute() non implémenté');
  }

  undo() {
    throw new Error('undo() non implémenté');
  }

  // chaque sous-classe redéfinit son propre libellé pour l'historique
  get label() {
    return 'Commande';
  }
}
