// Journal de course : événements réels du week-end, du plus récent au plus ancien.
// événement : { tour: number|null, type, texte, etat?, suite? }

import { el, badgeEtat } from './dom.js';

const MAX_ENTREES = 250;

export class Journal {
  #entrees = [];

  constructor(liste) {
    this.liste = liste;
  }

  ajouter(evenement) {
    this.#entrees.unshift(evenement);
    if (this.#entrees.length > MAX_ENTREES) {
      this.#entrees.length = MAX_ENTREES;
    }
  }

  rendre() {
    if (!this.liste) return;
    this.liste.replaceChildren(...this.#entrees.map(({ tour, type, texte, etat, suite }) => (
      el('li', { className: `journal-entry journal-entry--${type === 'Phase' || type === 'Arrivée' ? 'phase' : 'course'}` },
        el('span', { className: 'journal-entry__time', text: tour ? `T.${tour}` : '—' }),
        el('span', { className: 'journal-entry__type', text: type }),
        el('p', { className: 'journal-entry__text' },
          texte,
          etat ? [' ', badgeEtat(etat)] : null,
          suite ?? null))
    )));
  }
}
