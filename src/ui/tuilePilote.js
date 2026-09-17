// Tuile du pilote contrôlé : état (State), calcul de la vitesse (Decorator),
// technique, actions de la phase (Command), verdicts (Proxy) et historique.

import { el, badgeEtat, classeEtat, formaterStat } from './dom.js';
import { PiloteDecorator } from '../decorator/PiloteDecorator.js';
import { BonusVitesseDecorator } from '../decorator/decorators/BonusVitesseDecorator.js';
import { MalusEquipementDecorator } from '../decorator/decorators/MalusEquipementDecorator.js';
import { PHASES } from '../engine/RaceWeekend.js';
import { PENALITE_STAND, STAT_MAX } from '../engine/Chronometre.js';

const ALERTES = {
  'Perte Attention': (m) => `Vitesse ×${m} pendant ce tour, retour en Normal au tour suivant.`,
  Fatigué: (m) => `Vitesse ×${m}. Passe en Épuisé après 3 tours sans soin : pense au stand ou à une technique de soin.`,
  Épuisé: (m) => `Vitesse ×${m}. Aucune sortie automatique : seul un soin (stand ou technique) le remet en Normal.`,
};

const LIBELLES_CIBLE = {
  soi: 'Sur soi-même',
  devant: 'Le pilote juste devant',
  derriere: 'Le pilote juste derrière',
  proche: "L'adversaire le plus proche au chrono",
};

export function rendreTuilePilote({ engine, direction, piloteId, db }) {
  const tuile = document.querySelector('.tile--pilote');
  const pilote = engine.getPilote(piloteId);
  const entree = engine.dernierClassement.find((e) => e.id === piloteId);
  const modificateur = pilote.state.getModificateurVitesse();
  const alerte = ALERTES[pilote.state.nom];
  const ecurie = db.getEcurieById(pilote.ecurie)?.nom ?? pilote.ecurie;

  tuile.replaceChildren(
    el('div', { className: 'pilote-head' },
      el('h2', { className: 'pilote-head__name', attrs: { id: 'pilote-title' } },
        pilote.pseudo,
        el('span', { className: 'pilote-head__numero', text: `#${pilote.numero}` })),
      el('p', { className: 'pilote-head__meta', text: `P${entree?.position ?? '—'} · ${ecurie}, classe ${pilote.classe}` }),
      badgeEtat(pilote.state.nom)),

    alerte ? el('p', {
      className: `pilote-alert pilote-alert--${classeEtat(pilote.state.nom)}`,
      text: alerte(String(modificateur).replace('.', ',')),
    }) : null,

    blocStat({
      id: 'stat-vitesse',
      nom: 'Vitesse',
      valeur: pilote.getVitesse(),
      tags: detailVitesse(pilote),
    }),
    blocStat({
      id: 'stat-controle',
      nom: 'Contrôle',
      valeur: pilote.getControle(),
      tags: detailControle(pilote),
    }),

    el('div', { className: 'technique' },
      el('h3', { className: 'technique__nom', text: pilote.technique.nom }),
      el('p', { className: 'technique__desc', text: pilote.technique.description }),
      el('p', { className: 'technique__effet', text: pilote.technique.effet }),
      el('p', { className: 'technique__cible', text: `Cible : ${LIBELLES_CIBLE[pilote.technique.cible] ?? '—'}` })),

    blocActions(engine, pilote),
    blocDirection(engine, direction, pilote),
    blocHistorique(engine, pilote),
  );
}

function blocStat({ id, nom, valeur, tags }) {
  const affichee = Math.round(valeur * 10) / 10;
  return el('div', { className: 'stat' },
    el('p', { className: 'stat__head' },
      el('span', { attrs: { id }, text: nom }),
      el('span', { className: 'stat__value' }, formaterStat(affichee), ' ', el('small', { text: `/${STAT_MAX}` }))),
    el('div', {
      className: 'meter',
      style: { '--value': Math.min(STAT_MAX, Math.max(0, affichee)) },
      attrs: { role: 'meter', 'aria-labelledby': id, 'aria-valuemin': 0, 'aria-valuemax': STAT_MAX, 'aria-valuenow': affichee },
    }),
    el('ul', { className: 'decorator-list', attrs: { 'aria-label': `Calcul : ${nom.toLowerCase()}` } }, ...tags));
}

// Decorators du plus interne au plus externe, dans l'ordre où getVitesse() les applique
function chaineDecorateurs(pilote) {
  const chaine = [];
  let courant = pilote;
  while (courant instanceof PiloteDecorator) {
    chaine.unshift(courant);
    courant = courant.pilote;
  }
  return chaine;
}

function tag(texte, valeur, variante = '') {
  return el('li', { className: `tag${variante ? ` tag--${variante}` : ''}` }, `${texte} `, el('b', { text: valeur }));
}

function detailVitesse(pilote) {
  const modificateur = pilote.state.getModificateurVitesse();
  const tags = [tag('Base', formaterStat(pilote.stats.vitesse))];
  if (modificateur !== 1) {
    tags.push(tag(pilote.state.nom, `×${modificateur}`, 'malus'));
  }
  chaineDecorateurs(pilote).forEach((decorateur) => {
    if (decorateur instanceof BonusVitesseDecorator) tags.push(tag('Bonus vitesse', `+${decorateur.bonus}`, 'bonus'));
    if (decorateur instanceof MalusEquipementDecorator) tags.push(tag('Malus équipement', `−${decorateur.malus}`, 'malus'));
  });
  return tags;
}

function detailControle(pilote) {
  const tags = [tag('Base', formaterStat(pilote.stats.controle))];
  chaineDecorateurs(pilote).forEach((decorateur) => {
    if (decorateur instanceof MalusEquipementDecorator) tags.push(tag('Malus équipement', `−${decorateur.malus}`, 'malus'));
  });
  return tags;
}

function bouton(label, action, { primaire = false, dataset = {}, disabled = false } = {}) {
  return el('button', {
    className: `btn ${primaire ? 'btn--primary' : 'btn--secondary'} btn--sm`,
    dataset: { action, ...dataset },
    attrs: { type: 'button', disabled },
    text: label,
  });
}

function blocActions(engine, pilote) {
  const fini = engine.terminee;
  const boutons = [];

  if (engine.phase === PHASES.ESSAIS) {
    boutons.push(
      bouton("S'entraîner : vitesse +1", 'entrainer', { dataset: { stat: 'vitesse' }, disabled: fini }),
      bouton("S'entraîner : contrôle +1", 'entrainer', { dataset: { stat: 'controle' }, disabled: fini }),
    );
  } else {
    const cible = engine.cibleTechnique(pilote);
    const surCible = pilote.technique.cible === 'soi' ? '' : ` sur ${cible?.pseudo ?? '— (personne)'}`;
    boutons.push(
      bouton(`Utiliser ${pilote.technique.nom}${surCible}`, 'technique', { primaire: true, disabled: fini }),
      bouton('Accélérer +2', 'accelerer', { disabled: fini }),
    );
    if (engine.phase === PHASES.COURSE) {
      const devant = engine.piloteDevant(pilote.id);
      boutons.push(
        bouton(devant ? `Dépasser ${devant.pseudo}` : 'Dépasser (en tête)', 'depasser', { disabled: fini }),
        bouton(`Stand +${PENALITE_STAND} s`, 'stand', { disabled: fini }),
      );
    }
  }

  const actionDuTour = engine.invoker.historique.find((c) => c.pilote.id === pilote.id && c.tour === engine.tour);
  let note = 'Une action par tour, validée par la Direction de course. Elle compte pour le tour en cours.';
  if (fini) note = 'Session terminée : plus aucune action possible.';
  else if (actionDuTour) note = `Action du tour ${engine.tour} : ${actionDuTour.label}. Boucle le tour pour agir à nouveau.`;

  return el('div', { className: 'pilote-actions' },
    ...boutons,
    el('p', { className: 'pilote-actions__note', text: note }));
}

function blocDirection(engine, direction, pilote) {
  const verdicts = direction.verdicts
    .filter((v) => v.piloteId === pilote.id && v.phase === engine.phase)
    .slice(-5)
    .reverse();

  return el('div', { className: 'direction-control' },
    el('div', { className: 'direction-control__head' },
      el('h3', { className: 'direction-control__title', text: 'Direction de course' }),
      el('p', { className: 'tile__meta', text: 'Proxy' })),
    verdicts.length === 0
      ? el('p', { className: 'vide', text: 'Aucune action soumise pendant cette phase.' })
      : el('ul', { className: 'direction-control__list' }, ...verdicts.map(({ autorise, commande, motif, tour }) => (
        el('li', { className: 'direction-control__entry' },
          el('span', { className: `direction-verdict direction-verdict--${autorise ? 'ok' : 'refused'}`, text: autorise ? 'Validée' : 'Refusée' }),
          el('span', { className: 'direction-control__text', text: `T.${tour} ${commande} — ${motif}` }))
      ))));
}

function blocHistorique(engine, pilote) {
  const commandes = engine.invoker.historique.filter((c) => c.pilote.id === pilote.id).reverse();
  const derniere = engine.invoker.historique.at(-1);
  const annulable = !engine.terminee && derniere?.pilote.id === pilote.id && derniere.tour === engine.tour;

  return el('div', { className: 'command-history' },
    el('div', { className: 'command-history__head' },
      el('h3', { className: 'command-history__title', text: 'Commandes exécutées' }),
      bouton(annulable ? `Annuler ${derniere.label}` : 'Annuler', 'annuler', { disabled: !annulable })),
    commandes.length === 0
      ? el('p', { className: 'vide', text: 'Aucune commande pendant cette phase.' })
      : el('ol', { className: 'command-history__list' }, ...commandes.map((command) => (
        el('li', {}, el('span', { className: 'command-history__time', text: `T.${command.tour}` }), command.label)
      ))));
}
