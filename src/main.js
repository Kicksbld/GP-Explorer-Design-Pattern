import { PiloteDatabase } from './core/PiloteDatabase.js';
import { PiloteFactory } from './factory/PiloteFactory.js';
import { PiloteBuilder } from './builder/PiloteBuilder.js';
import { Spectator } from './observer/Spectator.js';
import { Commentateur } from './observer/Commentateur.js';
import { RaceEngine } from './engine/RaceEngine.js';
import { RaceWeekend, PHASES, TOURS_PAR_PHASE } from './engine/RaceWeekend.js';
import { PiloteIA } from './engine/PiloteIA.js';
import { formaterTemps, PENALITE_STAND } from './engine/Chronometre.js';
import { AccelererCommand } from './command/commands/AccelererCommand.js';
import { DepasserCommand } from './command/commands/DepasserCommand.js';
import { UtiliserTechniqueCommand } from './command/commands/UtiliserTechniqueCommand.js';
import { PasserAuStandCommand } from './command/commands/PasserAuStandCommand.js';
import { EntrainerCommand } from './command/commands/EntrainerCommand.js';
import { MalusEquipementDecorator } from './decorator/decorators/MalusEquipementDecorator.js';
import { DirectionCourseProxy } from './proxy/DirectionCourseProxy.js';
import { CourseCaretaker } from './memento/CourseCaretaker.js';
import { afficherAccueil, REGLAGES } from './ui/accueil.js';
import { rendreEntete, rendreStatut, rendreDuel, rendreEcuries, NOMS_PHASE } from './ui/tableauDeBord.js';
import { rendreTuilePilote } from './ui/tuilePilote.js';
import { Journal } from './ui/journal.js';
import { afficherResultats, fermerResultats } from './ui/resultats.js';

// Point d'entrée : écran d'accueil, puis week-end complet (essais, qualifs, course)
// piloté depuis le dashboard. Toutes les actions passent par la Direction de course.

// Le pilote du joueur passe par le Builder plutôt que par la seule Factory :
// même classe, mais personnalisé avec le réglage choisi sur l'écran d'accueil.
function construirePiloteJoueur(data, reglage) {
  const builder = new PiloteBuilder()
    .avecIdentite(data.id, data.pseudo, data.numero)
    .avecClasse(data.classe)
    .avecEcurie(data.ecurie)
    .avecImage(data.image)
    .avecTechnique(data.technique)
    .avecStat('vitesse', data.stats.vitesse)
    .avecStat('controle', data.stats.controle);

  if (reglage === 'controle') {
    builder.avecStat('controle', data.stats.controle + REGLAGES.controle.bonus);
  } else {
    builder.avecBonusVitesse(REGLAGES.vitesse.bonus);
  }
  return builder.build();
}

class Partie {
  #evenementsEnAttente = [];

  constructor(db, { piloteId, reglage }) {
    this.db = db;
    this.suiviId = piloteId;

    const pilotes = db.getPilotes().map((data) => (
      data.id === piloteId ? construirePiloteJoueur(data, reglage) : PiloteFactory.create(data)
    ));

    this.engine = new RaceEngine(pilotes);
    this.weekend = new RaceWeekend(this.engine);
    this.direction = new DirectionCourseProxy(this.engine);
    this.ia = new PiloteIA(this.engine);
    this.caretaker = new CourseCaretaker();
    this.sauvegarde = null;
    this.journal = new Journal(document.querySelector('.journal-feed'));
    this.dialog = document.querySelector('.resultats');

    this.spectator = new Spectator('Tribune Principale');
    this.spectator.piloteSuiviId = piloteId;
    // les événements du Commentateur sont mis en attente pour apparaître
    // dans le journal juste après l'action qui les a provoqués
    this.commentateur = new Commentateur(this.engine, {
      onEvenement: (evenement) => this.#evenementsEnAttente.push(evenement),
      estSuivi: (id) => id === this.suiviId,
    });
    this.engine.classement.subscribe(this.spectator);
    this.engine.classement.subscribe(this.commentateur);
  }

  demarrer() {
    const joueur = this.engine.getPilote(this.suiviId);
    this.weekend.demarrer(this.db.getPilotes().map((p) => p.id));
    this.#journaliser({
      tour: null,
      type: 'Phase',
      texte: `Bienvenue au GP Explorer ! ${joueur.pseudo} prend la piste pour les essais libres : ${TOURS_PAR_PHASE[PHASES.ESSAIS]} tours pour s'entraîner.`,
    });

    document.addEventListener('click', (event) => {
      const declencheur = event.target.closest('[data-action]');
      if (!declencheur || declencheur.disabled) return;
      this.#actions[declencheur.dataset.action]?.(declencheur.dataset);
    });

    this.rafraichir();
  }

  #actions = {
    'tour-suivant': () => this.tourSuivant(),
    'phase-suivante': () => this.phaseSuivante(),
    podium: () => this.afficherPodium(),
    sauvegarder: () => this.sauvegarder(),
    restaurer: () => this.restaurer(),
    annuler: () => this.annuler(),
    selectionner: ({ piloteId }) => this.suivre(piloteId),
    entrainer: ({ stat }) => this.agir((pilote) => new EntrainerCommand(pilote, stat)),
    accelerer: () => this.agir((pilote) => new AccelererCommand(pilote)),
    depasser: () => this.agir((pilote) => new DepasserCommand(pilote, this.engine.piloteDevant(pilote.id))),
    stand: () => this.agir((pilote) => new PasserAuStandCommand(this.engine, pilote)),
    technique: () => this.agir((pilote) => new UtiliserTechniqueCommand(this.engine, pilote, this.engine.cibleTechnique(pilote))),
    'fermer-resultats': () => fermerResultats(this.dialog),
    'nouveau-weekend': () => window.location.reload(),
  };

  rafraichir() {
    this.#viderEvenements();
    const { engine, weekend, direction, db, suiviId, sauvegarde } = this;
    rendreEntete({ engine, weekend, sauvegarde });
    rendreStatut(engine);
    rendreDuel(engine, suiviId);
    rendreEcuries(engine, db, suiviId);
    rendreTuilePilote({ engine, direction, piloteId: suiviId, db });
    document.querySelector('#classement-meta').textContent = this.#metaClassement();
    this.journal.rendre();
  }

  // --- actions du pilote suivi

  // la commande est construite avec l'instance courante du pilote (elle peut
  // avoir été remplacée par une version décorée) puis soumise au Proxy
  agir(fabrique) {
    const commande = fabrique(this.engine.getPilote(this.suiviId));
    this.#soumettre(commande);
    this.rafraichir();
  }

  #soumettre(commande, { journaliser = true } = {}) {
    const { engine } = this;
    const avant = {
      etat: commande.pilote.state.nom,
      stats: { ...commande.pilote.stats },
      cibleInstance: commande.cible ? engine.getPilote(commande.cible.id) : null,
      cibleEtat: commande.cible?.state.nom,
    };

    try {
      this.direction.executer(commande);
    } catch {
      return false; // refus consigné dans direction.verdicts
    }

    if (journaliser) this.#journaliserCommande(commande, avant);
    this.#viderEvenements();
    return true;
  }

  #journaliserCommande(commande, avant) {
    const { engine } = this;
    const { pilote, cible } = commande;
    const tour = engine.tour;

    if (commande instanceof UtiliserTechniqueCommand) {
      const cibleApres = cible ? engine.getPilote(cible.id) : null;
      const malusPose = cible && cibleApres !== avant.cibleInstance && cibleApres instanceof MalusEquipementDecorator;
      const sansEffet = !malusPose
        && pilote.state.nom === avant.etat
        && JSON.stringify(pilote.stats) === JSON.stringify(avant.stats)
        && (!cible || cibleApres.state.nom === avant.cibleEtat);
      this.#journaliser({
        tour,
        type: 'Technique',
        texte: `${pilote.pseudo} utilise « ${pilote.technique.nom} »${cible ? ` sur ${cible.pseudo}` : ''}${sansEffet ? ', sans effet.' : '.'}`,
      });
      if (malusPose) {
        this.#journaliser({ tour, type: 'Équipement', texte: `Équipement de ${cible.pseudo} endommagé : −${cibleApres.malus} en vitesse et en contrôle.` });
      }
    } else if (commande instanceof PasserAuStandCommand) {
      this.#journaliser({ tour, type: 'Stand', texte: `${pilote.pseudo} passe au stand (+${PENALITE_STAND} s sur ce tour).` });
    } else if (commande instanceof DepasserCommand) {
      this.#journaliser({ tour, type: 'Attaque', texte: `${pilote.pseudo} attaque ${cible.pseudo} : +3 en vitesse, −1 en contrôle.` });
    } else if (commande instanceof AccelererCommand) {
      this.#journaliser({ tour, type: 'Attaque', texte: `${pilote.pseudo} accélère : +2 en vitesse.` });
    } else if (commande instanceof EntrainerCommand) {
      const stat = commande.label.replace('Entraînement ', '');
      this.#journaliser({ tour, type: 'Entraînement', texte: `${pilote.pseudo} s'entraîne en ${stat}, qui passe à ${pilote.stats[commande.stat]}.` });
    }
  }

  annuler() {
    const { engine } = this;
    const derniere = engine.invoker.historique.at(-1);
    if (!derniere || derniere.pilote.id !== this.suiviId || derniere.tour !== engine.tour) return;

    this.commentateur.reinitialiser();
    engine.annulerDerniere();
    this.#journaliser({ tour: engine.tour, type: 'Annulation', texte: `${derniere.pilote.pseudo} annule « ${derniere.label} ».` });
    this.rafraichir();
  }

  suivre(piloteId) {
    if (!this.engine.getPilote(piloteId)) return;
    this.suiviId = piloteId;
    this.spectator.piloteSuiviId = piloteId;
    this.engine.rafraichirClassement();
    this.rafraichir();
  }

  // --- déroulé du week-end

  tourSuivant() {
    const { engine, ia } = this;
    if (engine.terminee) return;
    const tour = engine.tour;

    // l'IA joue pour tous les pilotes que le joueur ne suit pas
    const entrainements = { vitesse: 0, controle: 0 };
    engine.ordre.filter((id) => id !== this.suiviId).forEach((id) => {
      const commande = ia.deciderAction(engine.getPilote(id));
      if (!commande) return;
      const entrainement = commande instanceof EntrainerCommand;
      if (this.#soumettre(commande, { journaliser: !entrainement }) && entrainement) {
        entrainements[commande.stat] += 1;
      }
    });
    const nbEntrainements = entrainements.vitesse + entrainements.controle;
    if (nbEntrainements > 0) {
      this.#journaliser({
        tour,
        type: 'Entraînement',
        texte: `${nbEntrainements} pilotes s'entraînent : ${entrainements.vitesse} en vitesse, ${entrainements.controle} en contrôle.`,
      });
    }

    engine.tourSuivant();

    const meilleur = [...engine.chronos].reduce((top, [id, chrono]) => (
      !top || chrono.dernier < top.temps ? { id, temps: chrono.dernier } : top
    ), null);
    this.#journaliser({
      tour,
      type: 'Tour',
      texte: `Tour ${tour}/${engine.toursTotal} bouclé. Tour le plus rapide : ${engine.getPilote(meilleur.id).pseudo} en ${formaterTemps(meilleur.temps)}.`,
    });
    this.#viderEvenements();

    if (engine.terminee) this.#finDePhase();
    this.rafraichir();
  }

  #finDePhase() {
    const { engine, weekend } = this;
    const [p1, p2, p3] = engine.dernierClassement;

    if (weekend.termine) {
      this.#journaliser({
        tour: engine.tour,
        type: 'Arrivée',
        texte: `Drapeau à damier ! ${p1.pseudo} remporte le GP Explorer en ${formaterTemps(p1.temps)}, devant ${p2.pseudo} et ${p3.pseudo}.`,
      });
      this.afficherPodium();
      return;
    }

    const essais = weekend.phase === PHASES.ESSAIS;
    this.#journaliser({
      tour: engine.tour,
      type: 'Phase',
      texte: essais
        ? `Fin des essais libres : ${p1.pseudo} signe le meilleur temps en ${formaterTemps(p1.temps)}.`
        : `Fin des qualifs : pole position pour ${p1.pseudo} en ${formaterTemps(p1.temps)}.`,
    });

    afficherResultats(this.dialog, {
      surtitre: essais ? 'Fin des essais libres' : 'Fin des qualifications',
      titre: essais ? 'Top 3 des essais' : 'Grille de départ',
      entrees: [p1, p2, p3],
      actions: [
        { label: essais ? 'Passer aux qualifs' : 'Passer à la course', action: 'phase-suivante', primaire: true },
        { label: 'Voir le classement', action: 'fermer-resultats' },
      ],
    });
  }

  phaseSuivante() {
    const { engine, weekend } = this;
    if (!weekend.phaseTerminee) return;

    const aReparer = engine.pilotes.filter((p) => p instanceof MalusEquipementDecorator).map((p) => p.pseudo);
    this.commentateur.reinitialiser();
    if (!weekend.phaseSuivante()) return;

    // les sauvegardes Memento valent pour la phase en cours
    this.caretaker = new CourseCaretaker();
    this.sauvegarde = null;
    fermerResultats(this.dialog);

    const tours = TOURS_PAR_PHASE[weekend.phase];
    const pole = engine.getPilote(weekend.grille[0]);
    this.#journaliser({
      tour: null,
      type: 'Phase',
      texte: weekend.phase === PHASES.COURSE
        ? `Départ de la course : ${tours} tours, dans l'ordre des qualifs avec ${pole.pseudo} en pole. Tous les pilotes repartent reposés.`
        : `Début des ${NOMS_PHASE[weekend.phase].toLowerCase()} : ${tours} tours, le meilleur tour fixe la grille. Tous les pilotes repartent reposés.`,
    });
    if (aReparer.length > 0) {
      this.#journaliser({ tour: null, type: 'Garage', texte: `Réparations au garage : ${aReparer.join(', ')} retrouve${aReparer.length > 1 ? 'nt' : ''} un équipement sans malus.` });
    }
    this.rafraichir();
  }

  afficherPodium() {
    const [p1, p2, p3] = this.engine.dernierClassement;
    afficherResultats(this.dialog, {
      surtitre: `GP Explorer — ${this.engine.toursTotal} tours`,
      titre: 'Podium',
      entrees: [p1, p2, p3],
      final: true,
      actions: [
        { label: 'Nouveau week-end', action: 'nouveau-weekend', primaire: true },
        { label: 'Voir le classement complet', action: 'fermer-resultats' },
      ],
    });
  }

  // --- Memento

  sauvegarder() {
    const etat = this.engine.capturerEtat();
    this.caretaker.sauvegarder(etat);
    this.sauvegarde = { phase: etat.phase, tour: etat.tour };
    this.#journaliser({ tour: etat.tour, type: 'Sauvegarde', texte: `Course sauvegardée. Point de restauration disponible : T.${etat.tour}.` });
    this.rafraichir();
  }

  restaurer() {
    const etat = this.caretaker.restaurer();
    if (!etat) return;

    this.commentateur.reinitialiser();
    if (!this.engine.restaurerEtat(etat)) return;
    fermerResultats(this.dialog);
    this.#journaliser({ tour: etat.tour, type: 'Restauration', texte: `Retour au point de sauvegarde T.${etat.tour} : chronos, états et stats restaurés.` });
    this.rafraichir();
  }

  // --- journal

  #journaliser(evenement) {
    this.journal.ajouter(evenement);
  }

  #viderEvenements() {
    this.#evenementsEnAttente.splice(0).forEach((evenement) => this.journal.ajouter(evenement));
  }

  #metaClassement() {
    const { engine } = this;
    if (engine.phase === PHASES.COURSE) {
      return engine.toursBoucles === 0 ? 'Grille de départ' : `Écart au leader, tour ${engine.toursBoucles}/${engine.toursTotal}`;
    }
    return engine.toursBoucles === 0 ? 'Aucun tour chronométré' : `Meilleur tour, ${NOMS_PHASE[engine.phase].toLowerCase()}`;
  }
}

async function main() {
  const db = PiloteDatabase.getInstance();
  await db.load();

  const accueil = document.querySelector('#accueil');
  afficherAccueil(accueil, db, (choix) => {
    accueil.hidden = true;
    document.querySelector('.control-header').hidden = false;
    document.querySelector('#main').hidden = false;
    window.scrollTo(0, 0);
    new Partie(db, choix).demarrer();
  });
}

main();
