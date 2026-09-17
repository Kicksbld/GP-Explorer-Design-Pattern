// Overlay de résultats : top 3 d'une phase, ou podium final en grand au centre.

import { el } from './dom.js';
import { formaterEcart, formaterTemps } from '../engine/Chronometre.js';

// entrees : les 3 premières entrées du classement publié par le RaceEngine
export function afficherResultats(dialog, { surtitre, titre, entrees, actions, final = false }) {
  dialog.classList.toggle('resultats--final', final);
  dialog.setAttribute('aria-labelledby', 'resultats-title');

  dialog.replaceChildren(el('div', { className: 'resultats__inner' },
    el('p', { className: 'resultats__kicker', text: surtitre }),
    el('h2', { className: 'resultats__title', attrs: { id: 'resultats-title' }, text: titre }),
    el('ol', { className: 'resultats__podium' }, ...entrees.map(creerMarche)),
    el('div', { className: 'resultats__actions' }, ...actions.map(({ label, action, primaire }) => (
      el('button', {
        className: `btn ${primaire ? 'btn--primary' : 'btn--secondary'}`,
        dataset: { action },
        attrs: { type: 'button' },
        text: label,
      })
    )))));

  if (!dialog.open) dialog.showModal();
  dialog.querySelector('.btn--primary')?.focus();
}

export function fermerResultats(dialog) {
  if (dialog.open) dialog.close();
}

function creerMarche(entree) {
  const chrono = entree.position === 1 ? formaterTemps(entree.temps) : formaterEcart(entree.ecartLeader);

  return el('li', { className: `resultats__marche resultats__marche--${entree.position}` },
    el('figure', { className: 'resultats__portrait' },
      el('span', { className: 'resultats__numero', text: entree.numero, attrs: { 'aria-hidden': 'true' } }),
      el('img', { attrs: { src: entree.image, alt: '' } })),
    el('div', { className: 'resultats__socle' },
      el('span', { className: 'resultats__position', text: entree.position, attrs: { 'aria-label': `Position ${entree.position}` } }),
      el('p', { className: 'resultats__pseudo', text: entree.pseudo }),
      el('p', { className: 'resultats__ecurie', text: entree.ecurieNom }),
      el('p', { className: 'resultats__temps', text: chrono })));
}
