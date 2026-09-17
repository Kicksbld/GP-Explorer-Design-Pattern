// Pattern: State — classe de base pour Normal / PerteAttention / Fatigue / Epuise

export class PiloteState {
  get nom() {
    throw new Error('nom non implémenté');
  }

  tick(pilote) {
    // TODO: comportement par tour de course dans cet état
  }

  recevoirEffet(pilote, effet) {
    // TODO: transition éventuelle vers un autre state selon l'effet reçu
  }
}
