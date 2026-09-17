// Entité de base — étendue par les classes Factory (Youtubeur, Streameur, Rappeur)
// et enveloppée par les Decorator (bonus/malus).

import { NormalState } from '../state/NormalState.js';
import { MalusEquipementDecorator } from '../decorator/decorators/MalusEquipementDecorator.js';

const EFFETS_TECHNIQUE = {
  // soins : retirent l'état négatif et repassent en Normal
  'Keep Pushing': (pilote) => {
    pilote.state.recevoirEffet(pilote, 'soin');
    pilote.stats.vitesse += 1;
  },
  'Ça Fait Plaisir': (pilote) => pilote.state.recevoirEffet(pilote, 'soin'),
  'Tabarnak Turbo': (pilote) => {
    pilote.state.recevoirEffet(pilote, 'soin');
    pilote.stats.vitesse += 1;
  },
  'Rage Clutch': (pilote) => {
    if (pilote.state.nom === 'Épuisé') {
      pilote.state.recevoirEffet(pilote, 'soin');
      pilote.stats.vitesse += 2;
    }
  },

  // inflige Perte Attention à la cible
  'Câlin Surprise': (_pilote, cible) => cible?.state.recevoirEffet(cible, 'perte-attention'),
  'Freestyle Assassin': (_pilote, cible) => cible?.state.recevoirEffet(cible, 'perte-attention'),
  'Pas de Danse Hypnotique': (_pilote, cible) => cible?.state.recevoirEffet(cible, 'perte-attention'),
  'Sauce Piquante': (_pilote, cible) => cible?.state.recevoirEffet(cible, 'perte-attention'),
  "C'est Ciao": (_pilote, cible) => cible?.state.recevoirEffet(cible, 'perte-attention'),
  'Ombre du Boss': (_pilote, cible) => cible?.state.recevoirEffet(cible, 'perte-attention'),

  // inflige Fatigué à la cible
  'Cri de Guerre': (_pilote, cible) => cible?.state.recevoirEffet(cible, 'fatigue'),

  // boost de vitesse/contrôle ponctuel sur soi-même
  'Bendo Rush': (pilote) => { pilote.stats.vitesse += 1; },
  'Trajectoire Parfaite': (pilote) => { pilote.stats.vitesse += 1; },
  'Olé Drift': (pilote) => { pilote.stats.controle += 1; },
  'Mode Deter': (pilote) => {
    pilote.stats.vitesse += 2;
    if (Math.random() < 0.5) {
      pilote.state.recevoirEffet(pilote, 'fatigue');
    }
  },

  // malus d'équipement temporaire : renvoie la cible décorée (vitesse ET
  // maniabilité réduites) au lieu de muter ses stats ; RaceEngine.executerTechnique
  // se charge de remplacer la cible par cette version décorée dans son tableau.
  'Sale Coup Fourré': (_pilote, cible) => (cible ? new MalusEquipementDecorator(cible, 1) : undefined),
  'Robot Sabotage': (_pilote, cible) => (cible ? new MalusEquipementDecorator(cible, 1) : undefined),
};

export class Pilote {
  constructor({ id, pseudo, numero, ecurie, classe, technique, image, stats = {} }) {
    this.id = id;
    this.pseudo = pseudo;
    this.numero = numero;
    this.ecurie = ecurie;
    this.classe = classe;
    this.technique = technique;
    this.image = image;
    this.stats = { vitesse: 1, controle: 1, ...stats };
    this.state = new NormalState();
  }

  setState(state) {
    this.state = state;
  }

  tick() {
    this.state.tick(this);
  }

  utiliserTechnique(cible) {
    const effet = EFFETS_TECHNIQUE[this.technique?.nom];
    return effet ? effet(this, cible) : undefined;
  }

  getVitesse() {
    return Math.max(0, this.stats.vitesse) * this.state.getModificateurVitesse();
  }

  getControle() {
    return Math.max(0, this.stats.controle);
  }
}
