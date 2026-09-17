// Chronométrage : transforme les stats effectives d'un pilote (State et
// Decorator déjà appliqués par getVitesse/getControle) en temps au tour.

export const STAT_MAX = 10;
export const TEMPS_BASE = 95;        // secondes, pilote à 0 en vitesse et contrôle
export const GAIN_VITESSE = 0.8;     // secondes gagnées par point de vitesse
export const GAIN_CONTROLE = 0.5;    // secondes gagnées par point de contrôle
export const PENALITE_STAND = 15;    // secondes perdues par arrêt au stand
export const ECART_GRILLE = 0.3;     // secondes entre deux places sur la grille

const borner = (valeur) => Math.min(STAT_MAX, Math.max(0, valeur));

// plus le contrôle est haut, plus les tours sont réguliers
export function calculerTempsTour(pilote, aleatoire = Math.random) {
  const vitesse = borner(pilote.getVitesse());
  const controle = borner(pilote.getControle());
  const dispersion = 0.15 + 0.1 * (STAT_MAX - controle);
  return TEMPS_BASE - GAIN_VITESSE * vitesse - GAIN_CONTROLE * controle + aleatoire() * dispersion;
}

// 86.4123 -> "1:26.412"
export function formaterTemps(secondes) {
  const millisecondes = Math.round(secondes * 1000);
  const minutes = Math.floor(millisecondes / 60000);
  const reste = ((millisecondes % 60000) / 1000).toFixed(3).padStart(6, '0');
  return `${minutes}:${reste}`;
}

// 2.3149 -> "+2.315"
export function formaterEcart(secondes) {
  return `+${(Math.round(secondes * 1000) / 1000).toFixed(3)}`;
}
