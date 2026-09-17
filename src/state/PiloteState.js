// Pattern: State — classe de base pour Normal / PerteAttention / Fatigue / Epuise

export class PiloteState {
  get nom() {
    throw new Error('nom non implémenté');
  }

  // Facteur appliqué à la vitesse du pilote tant qu'il est dans cet état.
  getModificateurVitesse() {
    return 1;
  }

  tick(pilote) {
    // comportement neutre par défaut : rien ne se passe automatiquement
  }

  recevoirEffet(pilote, effet) {
    // ignoré par défaut ; chaque état concret décide des effets qu'il accepte
  }
}
