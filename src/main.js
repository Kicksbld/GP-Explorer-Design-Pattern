import { PiloteDatabase } from './core/PiloteDatabase.js';
import { PiloteFactory } from './factory/PiloteFactory.js';
import { PiloteBuilder } from './builder/PiloteBuilder.js';
import { Spectator } from './observer/Spectator.js';
import { RaceEngine } from './engine/RaceEngine.js';
import { RaceWeekend, PHASES } from './engine/RaceWeekend.js';
import { AccelererCommand } from './command/commands/AccelererCommand.js';
import { DepasserCommand } from './command/commands/DepasserCommand.js';
import { UtiliserTechniqueCommand } from './command/commands/UtiliserTechniqueCommand.js';
import { EcurieComposite } from './composite/EcurieComposite.js';

const LIBELLES_PHASE = {
  [PHASES.ESSAIS]: 'Essais',
  [PHASES.QUALIFS]: 'Qualifs',
  [PHASES.COURSE]: 'Course',
};
const ORDRE_PHASES = Object.values(PHASES);

function mettreAJourPhaseStepper(phase) {
  const liste = document.querySelector('.phase-stepper');
  if (!liste) return;

  const indexActuel = ORDRE_PHASES.indexOf(phase);
  liste.replaceChildren(...ORDRE_PHASES.map((p, index) => {
    const li = document.createElement('li');
    li.className = 'phase-stepper__item';

    const dot = document.createElement('span');
    dot.className = 'phase-stepper__dot';
    dot.setAttribute('aria-hidden', 'true');
    li.append(dot, LIBELLES_PHASE[p]);

    if (index < indexActuel) {
      li.classList.add('phase-stepper__item--done');
      const sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = ' (terminé)';
      li.appendChild(sr);
    } else if (index === indexActuel) {
      li.setAttribute('aria-current', 'step');
    }

    return li;
  }));
}

function mettreAJourHistorique(engine) {
  const liste = document.querySelector('.command-history__list');
  if (!liste) return;

  const entrees = engine.invoker.historique.slice().reverse();
  liste.replaceChildren(...entrees.map((command) => {
    const li = document.createElement('li');
    const temps = document.createElement('span');
    temps.className = 'command-history__time';
    temps.textContent = `T.${command.tour ?? engine.tour}`;
    li.append(temps, command.label);
    return li;
  }));
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

function mettreAJourEcuries(engine, db) {
  const liste = document.querySelector('.ecurie-list');
  if (!liste) return;

  const piloteSelectionneId = document.querySelector('[data-action="technique"]')?.dataset.piloteId;
  const ecurieSelectionnee = engine.pilotes.find((p) => p.id === piloteSelectionneId)?.ecurie;

  const lignes = [...construireEcuries(engine).entries()]
    .map(([ecurieId, composite]) => ({
      ecurieId,
      composite,
      nom: db.getEcurieById(ecurieId)?.nom ?? ecurieId,
      vitesseMoyenne: composite.getVitesseMoyenne(),
    }))
    .sort((a, b) => b.vitesseMoyenne - a.vitesseMoyenne);

  liste.replaceChildren(...lignes.map(({ ecurieId, composite, nom, vitesseMoyenne }) => {
    const li = document.createElement('li');
    li.className = 'ecurie-row';
    if (ecurieId === ecurieSelectionnee) li.classList.add('is-highlighted');
    li.dataset.ecurieId = ecurieId;
    li.style.setProperty('--v', vitesseMoyenne.toFixed(1));

    const avatars = document.createElement('span');
    avatars.className = 'ecurie-row__avatars';
    avatars.setAttribute('aria-hidden', 'true');
    composite.pilotes.forEach((pilote) => {
      const avatar = document.createElement('span');
      avatar.className = 'avatar avatar--sm';
      const img = document.createElement('img');
      img.src = pilote.image;
      img.alt = '';
      img.loading = 'lazy';
      avatar.appendChild(img);
      avatars.appendChild(avatar);
    });

    const identite = document.createElement('span');
    identite.className = 'ecurie-row__identity';
    const nomEl = document.createElement('span');
    nomEl.className = 'ecurie-row__nom';
    nomEl.textContent = nom;
    const pilotesEl = document.createElement('span');
    pilotesEl.className = 'ecurie-row__pilotes';
    pilotesEl.textContent = composite.pilotes.map((p) => p.pseudo).join(', ');
    identite.append(nomEl, pilotesEl);

    const mesure = document.createElement('span');
    mesure.className = 'ecurie-row__measure';
    const bar = document.createElement('span');
    bar.className = 'ecurie-row__bar';
    bar.setAttribute('aria-hidden', 'true');
    const stat = document.createElement('span');
    stat.className = 'ecurie-row__stat';
    stat.textContent = vitesseMoyenne.toFixed(1);
    mesure.append(bar, stat);

    li.append(avatars, identite, mesure);
    return li;
  }));
}

async function main() {
  const db = PiloteDatabase.getInstance();
  await db.load();

  const pilotes = db.getPilotes().map((data) => PiloteFactory.create(data));

  const engine = new RaceEngine(pilotes);
  engine.classement.subscribe(new Spectator('Tribune Principale'));

  const weekend = new RaceWeekend(engine);

  engine.tourSuivant();
  mettreAJourPhaseStepper(weekend.phase);
  mettreAJourHistorique(engine);
  mettreAJourEcuries(engine, db);

  document.querySelector('[data-action="tour-suivant"]')?.addEventListener('click', () => {
    engine.tourSuivant();
    mettreAJourEcuries(engine, db);
  });

  document.querySelector('[data-action="phase-suivante"]')?.addEventListener('click', () => {
    weekend.phaseSuivante();
    mettreAJourPhaseStepper(weekend.phase);
  });

  document.querySelectorAll('[data-action="technique"]').forEach((bouton) => {
    bouton.addEventListener('click', () => {
      const pilote = engine.pilotes.find((p) => p.id === bouton.dataset.piloteId);
      const cible = engine.pilotes.find((p) => p.id === bouton.dataset.cibleId);
      if (pilote) {
        engine.executer(new UtiliserTechniqueCommand(engine, pilote, cible));
        mettreAJourHistorique(engine);
        mettreAJourEcuries(engine, db);
      }
    });
  });

  document.querySelectorAll('[data-action="accelerer"]').forEach((bouton) => {
    bouton.addEventListener('click', () => {
      const pilote = engine.pilotes.find((p) => p.id === bouton.dataset.piloteId);
      if (pilote) {
        engine.executer(new AccelererCommand(pilote));
        mettreAJourHistorique(engine);
        mettreAJourEcuries(engine, db);
      }
    });
  });

  document.querySelectorAll('[data-action="depasser"]').forEach((bouton) => {
    bouton.addEventListener('click', () => {
      const pilote = engine.pilotes.find((p) => p.id === bouton.dataset.piloteId);
      const cible = engine.pilotes.find((p) => p.id === bouton.dataset.cibleId);
      if (pilote) {
        engine.executer(new DepasserCommand(pilote, cible));
        mettreAJourHistorique(engine);
        mettreAJourEcuries(engine, db);
      }
    });
  });

  document.querySelectorAll('[data-action="annuler"]').forEach((bouton) => {
    bouton.addEventListener('click', () => {
      engine.annulerDerniere();
      mettreAJourHistorique(engine);
      mettreAJourEcuries(engine, db);
    });
  });
}

main();
