// Rendus du dashboard : en-tête (phases + barre d'outils), statut de session,
// duel en piste et écuries (Composite). Tout est lu depuis le RaceEngine.

import { el, badgeEtat, formaterStat } from './dom.js';
import { EcurieComposite } from '../composite/EcurieComposite.js';
import { ORDRE_PHASES, PHASES } from '../engine/RaceWeekend.js';
import { formaterEcart, formaterTemps, STAT_MAX } from '../engine/Chronometre.js';

export const LIBELLES_PHASE = {
  [PHASES.ESSAIS]: 'Essais',
  [PHASES.QUALIFS]: 'Qualifs',
  [PHASES.COURSE]: 'Course',
};

export const NOMS_PHASE = {
  [PHASES.ESSAIS]: 'Essais libres',
  [PHASES.QUALIFS]: 'Qualifications',
  [PHASES.COURSE]: 'Course',
};

const PASSER_A = {
  [PHASES.QUALIFS]: 'Passer aux qualifs',
  [PHASES.COURSE]: 'Passer à la course',
};

export function rendreEntete({ engine, weekend, sauvegarde }) {
  const indexActuel = ORDRE_PHASES.indexOf(weekend.phase);
  document.querySelector('.phase-stepper')?.replaceChildren(...ORDRE_PHASES.map((phase, index) => {
    const termine = index < indexActuel || (index === indexActuel && weekend.termine);
    return el('li', {
      className: `phase-stepper__item${termine ? ' phase-stepper__item--done' : ''}`,
      attrs: { 'aria-current': index === indexActuel ? 'step' : null },
    },
    el('span', { className: 'phase-stepper__dot', attrs: { 'aria-hidden': 'true' } }),
    LIBELLES_PHASE[phase],
    termine ? el('span', { className: 'sr-only', text: ' (terminé)' }) : null);
  }));

  const bouton = (action) => document.querySelector(`.control-toolbar [data-action="${action}"]`);

  const tour = bouton('tour-suivant');
  tour.disabled = engine.terminee;
  tour.textContent = engine.terminee ? 'Phase terminée'
    : engine.tour === engine.toursTotal ? 'Dernier tour' : 'Tour suivant';

  const phase = bouton('phase-suivante');
  phase.hidden = weekend.termine;
  phase.disabled = !weekend.phaseTerminee;
  phase.textContent = PASSER_A[weekend.prochainePhase] ?? 'Phase suivante';

  bouton('podium').hidden = !weekend.termine;

  const restaurer = bouton('restaurer');
  const disponible = sauvegarde?.phase === weekend.phase;
  restaurer.disabled = !disponible;
  restaurer.textContent = disponible ? `Restaurer T.${sauvegarde.tour}` : 'Restaurer';
}

export function rendreStatut(engine) {
  const tuile = document.querySelector('.tile--status');
  const classement = engine.dernierClassement;
  const leader = classement[0];
  const course = engine.phase === PHASES.COURSE;

  let meilleurTour = null;
  engine.chronos.forEach((chrono, id) => {
    if (chrono.meilleur !== null && (!meilleurTour || chrono.meilleur < meilleurTour.temps)) {
      meilleurTour = { temps: chrono.meilleur, pseudo: engine.getPilote(id).pseudo };
    }
  });

  const libelleLeader = course ? 'En tête' : engine.phase === PHASES.QUALIFS ? 'Pole provisoire' : 'Plus rapide';
  let valeurLeader = ['—'];
  if (leader?.dernierTour !== null && leader?.dernierTour !== undefined) {
    valeurLeader = [leader.pseudo, el('small', { text: formaterTemps(leader.temps) })];
  } else if (course && leader) {
    valeurLeader = [leader.pseudo, el('small', { text: 'en pole sur la grille' })];
  }

  tuile.replaceChildren(
    el('div', { className: 'tile__head' },
      el('h2', { className: 'tile__title', attrs: { id: 'status-title' }, text: NOMS_PHASE[engine.phase] }),
      el('p', { className: `live-flag${engine.terminee ? ' live-flag--off' : ''}` },
        el('span', { className: 'live-flag__dot', attrs: { 'aria-hidden': 'true' } }),
        engine.terminee ? 'Terminé' : 'En direct')),
    el('div', { className: 'status-main' },
      el('div', { className: 'lap-counter' },
        el('p', { className: 'lap-counter__value', attrs: { 'aria-label': `Tour ${engine.tour} sur ${engine.toursTotal}` } },
          el('span', { className: 'lap-counter__label', text: 'Tour', attrs: { 'aria-hidden': 'true' } }),
          el('span', { className: 'lap-counter__current', text: engine.tour, attrs: { 'aria-hidden': 'true' } }),
          el('span', { className: 'lap-counter__total', text: `/${engine.toursTotal}`, attrs: { 'aria-hidden': 'true' } })),
        el('div', {
          className: 'meter meter--laps',
          style: { '--value': engine.toursBoucles, '--max': engine.toursTotal },
          attrs: {
            role: 'progressbar',
            'aria-label': 'Tours bouclés',
            'aria-valuemin': 0,
            'aria-valuemax': engine.toursTotal,
            'aria-valuenow': engine.toursBoucles,
          },
        })),
      el('dl', { className: 'race-facts' },
        el('div', {},
          el('dt', { text: 'Meilleur tour' }),
          el('dd', {}, ...(meilleurTour ? [meilleurTour.pseudo, el('small', { text: formaterTemps(meilleurTour.temps) })] : ['—']))),
        el('div', {},
          el('dt', { text: libelleLeader }),
          el('dd', {}, ...valeurLeader)))),
  );
}

export function rendreDuel(engine, piloteId) {
  const section = document.querySelector('.duel');
  const pilote = engine.getPilote(piloteId);
  const devant = engine.piloteDevant(piloteId);
  const adversaire = devant ?? engine.piloteDerriere(piloteId);
  const entree = (id) => engine.dernierClassement.find((e) => e.id === id);

  const ecart = adversaire ? Math.abs(engine.tempsReference(piloteId) - engine.tempsReference(adversaire.id)) : NaN;
  const texteEcart = Number.isFinite(ecart) ? `${formaterEcart(ecart).slice(1)} s ${devant ? 'devant' : 'derrière'}` : 'pas encore chronométré';

  section.replaceChildren(
    el('h2', { className: 'sr-only', attrs: { id: 'duel-title' }, text: adversaire ? `Duel en piste : ${pilote.pseudo} contre ${adversaire.pseudo}` : `Pilote suivi : ${pilote.pseudo}` }),
    carteDuel(pilote, entree(pilote.id), 'Ton pilote', null),
    adversaire ? carteDuel(adversaire, entree(adversaire.id), devant ? 'Pilote devant' : 'Poursuivant', texteEcart) : null,
  );
}

function carteDuel(pilote, entree, role, ecart) {
  return el('article', { className: 'duel-card surface-red', dataset: { piloteId: pilote.id } },
    el('span', { className: 'duel-card__numero', text: pilote.numero, attrs: { 'aria-hidden': 'true' } }),
    el('img', { className: 'duel-card__portrait', attrs: { src: pilote.image, alt: '', width: 648, height: 900 } }),
    el('div', { className: 'duel-card__top' },
      el('p', { className: 'duel-card__role', text: role }),
      badgeEtat(pilote.state.nom, 'duel-card__state surface-ink')),
    el('div', { className: 'duel-card__band' },
      ecart ? el('p', { className: 'duel-card__ecart', text: ecart }) : null,
      el('p', { className: 'duel-card__name' },
        el('span', { className: 'duel-card__pos', text: `P${entree?.position ?? '—'}` }),
        pilote.pseudo,
        el('span', { className: 'duel-card__ecurie', text: entree?.ecurieNom ?? '' }))));
}

// Regroupe les pilotes par écurie (Composite) pour agréger leur vitesse moyenne.
function construireEcuries(engine) {
  const composites = new Map();
  engine.pilotes.forEach((pilote) => {
    if (!composites.has(pilote.ecurie)) {
      composites.set(pilote.ecurie, new EcurieComposite(pilote.ecurie));
    }
    composites.get(pilote.ecurie).ajouter(pilote);
  });
  return composites;
}

export function rendreEcuries(engine, db, piloteId) {
  const liste = document.querySelector('.ecurie-list');
  const ecurieSuivie = engine.getPilote(piloteId)?.ecurie;

  const lignes = [...construireEcuries(engine).entries()]
    .map(([ecurieId, composite]) => ({
      ecurieId,
      composite,
      nom: db.getEcurieById(ecurieId)?.nom ?? ecurieId,
      vitesseMoyenne: composite.getVitesseMoyenne(),
    }))
    .sort((a, b) => b.vitesseMoyenne - a.vitesseMoyenne);

  liste.replaceChildren(...lignes.map(({ ecurieId, composite, nom, vitesseMoyenne }) => (
    el('li', {
      className: `ecurie-row${ecurieId === ecurieSuivie ? ' is-highlighted' : ''}`,
      dataset: { ecurieId },
      style: { '--v': Math.min(STAT_MAX, vitesseMoyenne).toFixed(2) },
    },
    el('span', { className: 'ecurie-row__avatars', attrs: { 'aria-hidden': 'true' } },
      ...composite.pilotes.map((pilote) => el('span', { className: 'avatar avatar--sm' },
        el('img', { attrs: { src: pilote.image, alt: '', loading: 'lazy' } })))),
    el('span', { className: 'ecurie-row__identity' },
      el('span', { className: 'ecurie-row__nom', text: nom }),
      el('span', { className: 'ecurie-row__pilotes', text: composite.pilotes.map((p) => p.pseudo).join(', ') })),
    el('span', { className: 'ecurie-row__measure' },
      el('span', { className: 'ecurie-row__bar', attrs: { 'aria-hidden': 'true' } }),
      el('span', { className: 'ecurie-row__stat', text: formaterStat(Math.round(vitesseMoyenne * 10) / 10) })))
  )));

  const pied = document.querySelector('.tile--ecuries .tile__foot-texte');
  if (pied) {
    pied.textContent = `${db.getEcurieById(ecurieSuivie)?.nom ?? ''}, l'écurie de ton pilote`;
  }
}
