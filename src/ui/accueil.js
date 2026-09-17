// Écran d'accueil : programme du week-end, choix du pilote et du réglage.
// Les stats affichées sont celles d'un pilote réellement créé par la Factory.

import { el } from './dom.js';
import { PiloteFactory } from '../factory/PiloteFactory.js';
import { ORDRE_PHASES, TOURS_PAR_PHASE, PHASES } from '../engine/RaceWeekend.js';
import { PENALITE_STAND } from '../engine/Chronometre.js';

// réglage appliqué par le PiloteBuilder au pilote du joueur
export const REGLAGES = {
  vitesse: {
    nom: 'Réglage vitesse',
    bonus: 1,
    detail: '+1 en vitesse effective, posé par le Builder avec un BonusVitesseDecorator (compte même quand le pilote est fatigué).',
  },
  controle: {
    nom: 'Réglage contrôle',
    bonus: 2,
    detail: '+2 en contrôle de base, posé par le Builder : tours plus rapides et plus réguliers.',
  },
};

const ETAPES = {
  [PHASES.ESSAIS]: {
    nom: 'Essais libres',
    desc: 'Entraîne ton pilote : +1 en vitesse ou en contrôle à chaque tour. Le meilleur tour fait le classement.',
  },
  [PHASES.QUALIFS]: {
    nom: 'Qualifications',
    desc: 'Accélère et sors ta technique. Le meilleur tour de chacun fixe la grille de départ.',
  },
  [PHASES.COURSE]: {
    nom: 'Course',
    desc: `Temps cumulés, techniques et arrêts au stand (+${PENALITE_STAND} s). Le podium se joue au dernier tour.`,
  },
};

export function afficherAccueil(racine, db, onLancer) {
  let piloteId = null;
  const bouton = racine.querySelector('[data-action="lancer"]');
  const resume = racine.querySelector('.accueil__choix');
  const grille = racine.querySelector('.accueil__pilotes');

  racine.querySelector('.accueil__etapes').replaceChildren(...ORDRE_PHASES.map((phase, index) => (
    el('li', { className: 'accueil__etape' },
      el('p', { className: 'accueil__etape-head' },
        el('span', { className: 'accueil__etape-index', text: `0${index + 1}` }),
        el('span', { className: 'accueil__etape-nom', text: ETAPES[phase].nom }),
        el('span', { className: 'accueil__etape-tours', text: `${TOURS_PAR_PHASE[phase]} tours` })),
      el('p', { className: 'accueil__etape-desc', text: ETAPES[phase].desc }))
  )));

  grille.replaceChildren(...db.getPilotes().map((data) => {
    const { stats } = PiloteFactory.create(data);
    const ecurie = db.getEcurieById(data.ecurie)?.nom ?? data.ecurie;
    return el('button', {
      className: 'carte-pilote',
      dataset: { piloteId: data.id },
      attrs: { type: 'button', 'aria-pressed': 'false', 'aria-label': `${data.pseudo}, ${ecurie}, classe ${data.classe}` },
    },
    el('span', { className: 'carte-pilote__numero', text: data.numero, attrs: { 'aria-hidden': 'true' } }),
    el('img', { className: 'carte-pilote__portrait', attrs: { src: data.image, alt: '', loading: 'lazy' } }),
    el('span', { className: 'carte-pilote__choisi', text: 'Ton pilote', attrs: { 'aria-hidden': 'true' } }),
    el('span', { className: 'carte-pilote__band' },
      el('span', { className: 'carte-pilote__pseudo', text: data.pseudo }),
      el('span', { className: 'carte-pilote__meta', text: `${ecurie} · ${data.classe}` }),
      el('span', { className: 'carte-pilote__stats', text: `V ${stats.vitesse} · C ${stats.controle}` })));
  }));

  racine.querySelector('.reglage-options').replaceChildren(...Object.entries(REGLAGES).map(([cle, reglage], index) => (
    el('label', { className: 'reglage' },
      el('input', { attrs: { type: 'radio', name: 'reglage', value: cle, checked: index === 0 } }),
      el('span', { className: 'reglage__nom', text: reglage.nom }),
      el('span', { className: 'reglage__detail', text: reglage.detail }))
  )));

  grille.addEventListener('click', (event) => {
    const carte = event.target.closest('.carte-pilote');
    if (!carte) return;
    piloteId = carte.dataset.piloteId;
    grille.querySelectorAll('.carte-pilote').forEach((c) => c.setAttribute('aria-pressed', String(c === carte)));
    const data = db.getPiloteById(piloteId);
    resume.textContent = `${data.pseudo} — ${db.getEcurieById(data.ecurie)?.nom}, classe ${data.classe}. Technique : ${data.technique.nom}.`;
    bouton.disabled = false;
  });

  bouton.addEventListener('click', () => {
    if (!piloteId) return;
    const reglage = racine.querySelector('input[name="reglage"]:checked')?.value ?? 'vitesse';
    onLancer({ piloteId, reglage });
  });
}
