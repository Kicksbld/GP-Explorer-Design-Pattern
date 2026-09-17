import { PiloteDatabase } from './core/PiloteDatabase.js';
import { PiloteFactory } from './factory/PiloteFactory.js';
import { PiloteBuilder } from './builder/PiloteBuilder.js';
import { Spectator } from './observer/Spectator.js';
import { RaceEngine } from './engine/RaceEngine.js';
import { RaceWeekend, PHASES } from './engine/RaceWeekend.js';
import { AccelererCommand } from './command/commands/AccelererCommand.js';
import { DepasserCommand } from './command/commands/DepasserCommand.js';
import { UtiliserTechniqueCommand } from './command/commands/UtiliserTechniqueCommand.js';

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

  document.querySelector('[data-action="tour-suivant"]')?.addEventListener('click', () => {
    engine.tourSuivant();
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
      }
    });
  });

  document.querySelectorAll('[data-action="accelerer"]').forEach((bouton) => {
    bouton.addEventListener('click', () => {
      const pilote = engine.pilotes.find((p) => p.id === bouton.dataset.piloteId);
      if (pilote) {
        engine.executer(new AccelererCommand(pilote));
        mettreAJourHistorique(engine);
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
      }
    });
  });

  document.querySelectorAll('[data-action="annuler"]').forEach((bouton) => {
    bouton.addEventListener('click', () => {
      engine.annulerDerniere();
      mettreAJourHistorique(engine);
    });
  });
}

main();
