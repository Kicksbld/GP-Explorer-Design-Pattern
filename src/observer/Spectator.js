// Observer concret : affiche le classement reçu dans `.classement-list` du dashboard.
// chaque entrée : { position, id, pseudo, numero, image, ecurieNom, stateNom,
//                   temps, dernierTour, ecartLeader, mouvement }

import { el, badgeEtat } from '../ui/dom.js';
import { formaterEcart, formaterTemps } from '../engine/Chronometre.js';

export class Spectator {
  constructor(nom) {
    this.nom = nom;
    this.piloteSuiviId = null; // ligne mise en avant : le pilote contrôlé par le joueur
  }

  update(classement) {
    const liste = document.querySelector('.classement-list');
    if (!liste) return;

    liste.replaceChildren(...classement.map((entree) => this.#creerLigne(entree)));
  }

  #creerLigne(entree) {
    const suivi = entree.id === this.piloteSuiviId;

    return el('li', {
      className: `classement-row${suivi ? ' surface-ink' : ''}`,
      dataset: { piloteId: entree.id },
      attrs: { 'aria-current': suivi ? 'true' : null },
    },
    el('span', { className: 'classement-row__pos' },
      String(entree.position),
      this.#fleche(entree.mouvement)),
    el('span', { className: 'avatar' },
      el('img', { attrs: { src: entree.image ?? '', alt: '', loading: 'lazy' } })),
    el('span', { className: 'classement-row__identity' },
      el('span', { className: 'classement-row__pseudo' },
        entree.pseudo,
        el('span', { className: 'classement-row__numero', text: `#${entree.numero}` })),
      el('span', { className: 'classement-row__meta' },
        `${entree.ecurieNom} `,
        badgeEtat(entree.stateNom))),
    el('span', { className: 'classement-row__gap', text: this.#ecart(entree) }),
    el('button', {
      className: 'classement-row__select',
      dataset: { action: 'selectionner', piloteId: entree.id },
      attrs: { type: 'button', 'aria-label': `Prendre le contrôle de ${entree.pseudo}`, 'aria-pressed': suivi ? 'true' : 'false' },
    }));
  }

  #fleche(mouvement) {
    if (!mouvement) return null;
    const gagne = mouvement > 0;
    const places = Math.abs(mouvement);
    return [
      el('span', { className: `move move--${gagne ? 'up' : 'down'}`, attrs: { 'aria-hidden': 'true' } }),
      el('span', { className: 'sr-only', text: `, ${gagne ? 'gagne' : 'perd'} ${places} place${places > 1 ? 's' : ''}` }),
    ];
  }

  // leader : son temps (meilleur tour ou total), les autres : écart au leader
  #ecart(entree) {
    if (entree.temps === null) return '—';
    if (entree.position === 1) return entree.dernierTour === null ? 'Leader' : formaterTemps(entree.temps);
    return formaterEcart(entree.ecartLeader);
  }
}
