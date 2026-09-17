// Pattern: Factory
// Choisit la sous-classe de Pilote à instancier selon le champ `classe` du JSON.

import { Youtubeur } from './classes/Youtubeur.js';
import { Streameur } from './classes/Streameur.js';
import { Rappeur } from './classes/Rappeur.js';

const CLASSES = {
  Youtubeur,
  Streameur,
  Rappeur,
};

export class PiloteFactory {
  static create(data) {
    const PiloteClasse = CLASSES[data.classe];
    if (!PiloteClasse) {
      throw new Error(`Classe de pilote inconnue: ${data.classe}`);
    }
    return new PiloteClasse(data);
  }
}
