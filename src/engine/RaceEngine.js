// Moteur de course : fait le lien entre State, Observer, Command et Decorator
// sur les Pilote fournis par PiloteDatabase. Il chronomètre chaque tour, publie
// le classement aux observers et sert d'originator au Memento.

import { ClassementSubject } from '../observer/ClassementSubject.js';
import { CourseInvoker } from '../command/CourseInvoker.js';
import { PiloteDatabase } from '../core/PiloteDatabase.js';
import { MalusEquipementDecorator } from '../decorator/decorators/MalusEquipementDecorator.js';
import { NormalState } from '../state/NormalState.js';
import { PerteAttentionState } from '../state/PerteAttentionState.js';
import { FatigueState } from '../state/FatigueState.js';
import { EpuiseState } from '../state/EpuiseState.js';
import { PHASES } from './RaceWeekend.js';
import { calculerTempsTour, ECART_GRILLE } from './Chronometre.js';

const CLASSES_ETAT = {
  Normal: NormalState,
  'Perte Attention': PerteAttentionState,
  Fatigué: FatigueState,
  Épuisé: EpuiseState,
};

export class RaceEngine {
  constructor(pilotes) {
    this.pilotes = pilotes;
    this.classement = new ClassementSubject();
    this.invoker = new CourseInvoker();
    this.phase = null;
    this.tour = 0;          // tour en cours dans la session
    this.toursTotal = 0;
    this.terminee = false;
    this.chronos = new Map();    // id -> { total, meilleur, dernier }
    this.penalites = new Map();  // id -> secondes ajoutées au tour en cours
    this.mouvements = new Map(); // id -> places gagnées (+) ou perdues (-) au dernier tour
    this.ordre = pilotes.map((p) => p.id);
    this.dernierClassement = [];
  }

  get toursBoucles() {
    return this.terminee ? this.tour : Math.max(0, this.tour - 1);
  }

  // Nouvelle session (essais, qualifs ou course) : chronos remis à zéro, pilotes
  // reposés (état Normal) et équipement réparé (les malus Decorator sont retirés).
  demarrerSession({ phase, toursTotal, ordreInitial = this.ordre }) {
    this.phase = phase;
    this.toursTotal = toursTotal;
    this.tour = 1;
    this.terminee = false;
    this.invoker = new CourseInvoker();
    this.ordre = [...ordreInitial];
    this.penalites.clear();
    this.mouvements.clear();
    this.chronos = new Map(this.ordre.map((id, index) => [id, {
      total: phase === PHASES.COURSE ? index * ECART_GRILLE : 0,
      meilleur: null,
      dernier: null,
    }]));

    this.pilotes.forEach((pilote, index) => {
      let repare = pilote;
      while (repare instanceof MalusEquipementDecorator) {
        repare = repare.pilote;
      }
      this.pilotes[index] = repare;
      repare.setState(new NormalState());
    });

    this.#publierClassement();
  }

  // Boucle le tour en cours : chronos calculés avec les états actuels, puis
  // les états évoluent (tick) pour le tour suivant.
  tourSuivant() {
    if (this.terminee || !this.phase) return;

    const positionsAvant = new Map(this.ordre.map((id, index) => [id, index]));

    this.pilotes.forEach((pilote) => {
      const chrono = this.chronos.get(pilote.id);
      const temps = calculerTempsTour(pilote) + (this.penalites.get(pilote.id) ?? 0);
      chrono.dernier = temps;
      chrono.meilleur = chrono.meilleur === null ? temps : Math.min(chrono.meilleur, temps);
      chrono.total += temps;
    });
    this.penalites.clear();

    this.pilotes.forEach((p) => p.tick());

    if (this.tour >= this.toursTotal) {
      this.terminee = true;
    } else {
      this.tour += 1;
    }

    const nouvelOrdre = this.#trier();
    this.mouvements = new Map(nouvelOrdre.map((id, index) => [id, positionsAvant.get(id) - index]));
    this.#publierClassement();
  }

  executer(command) {
    command.tour = this.tour;
    this.invoker.executer(command);
    this.#publierClassement();
  }

  annulerDerniere() {
    this.invoker.annulerDerniere();
    this.#publierClassement();
  }

  // republie le classement sans avancer le tour
  rafraichirClassement() {
    this.#publierClassement();
  }

  // déclenche la technique d'un pilote et remplace la cible dans le tableau
  // si l'effet renvoie une version décorée (ex: MalusEquipementDecorator)
  executerTechnique(pilote, cible) {
    const resultat = pilote.utiliserTechnique(cible);
    if (resultat && cible) {
      this.remplacerPilote(cible, resultat);
    }
    this.#publierClassement();
    return resultat;
  }

  remplacerPilote(ancien, nouveau) {
    const index = this.pilotes.indexOf(ancien);
    if (index !== -1) {
      this.pilotes[index] = nouveau;
    }
  }

  ajouterPenalite(id, secondes) {
    this.penalites.set(id, (this.penalites.get(id) ?? 0) + secondes);
  }

  retirerPenalite(id, secondes) {
    const reste = (this.penalites.get(id) ?? 0) - secondes;
    if (reste > 0) {
      this.penalites.set(id, reste);
    } else {
      this.penalites.delete(id);
    }
  }

  getPilote(id) {
    return this.pilotes.find((p) => p.id === id);
  }

  piloteDevant(id) {
    const index = this.ordre.indexOf(id);
    return index > 0 ? this.getPilote(this.ordre[index - 1]) : undefined;
  }

  piloteDerriere(id) {
    const index = this.ordre.indexOf(id);
    return index !== -1 && index < this.ordre.length - 1 ? this.getPilote(this.ordre[index + 1]) : undefined;
  }

  // voisin (devant ou derrière) avec le plus petit écart au chrono
  piloteProche(id) {
    const devant = this.piloteDevant(id);
    const derriere = this.piloteDerriere(id);
    if (!devant || !derriere) return devant ?? derriere;
    const temps = this.tempsReference(id);
    const ecartDevant = temps - this.tempsReference(devant.id);
    const ecartDerriere = this.tempsReference(derriere.id) - temps;
    return ecartDerriere < ecartDevant ? derriere : devant;
  }

  // adversaire visé par la technique d'un pilote, selon `technique.cible` (db.json)
  cibleTechnique(pilote) {
    switch (pilote.technique?.cible) {
      case 'devant': return this.piloteDevant(pilote.id) ?? null;
      case 'derriere': return this.piloteDerriere(pilote.id) ?? null;
      case 'proche': return this.piloteProche(pilote.id) ?? null;
      default: return null;
    }
  }

  // temps qui sert au classement : meilleur tour en essais/qualifs, temps total en course
  tempsReference(id) {
    const chrono = this.chronos.get(id);
    if (!chrono) return Infinity;
    if (this.phase === PHASES.COURSE) return chrono.total;
    return chrono.meilleur ?? Infinity;
  }

  // --- Memento : l'engine est l'originator, le snapshot ne contient que des
  // données brutes (structuredClone-compatibles), jamais d'instances Pilote/State.

  capturerEtat() {
    return {
      phase: this.phase,
      tour: this.tour,
      terminee: this.terminee,
      ordre: [...this.ordre],
      chronos: [...this.chronos].map(([id, chrono]) => ({ id, ...chrono })),
      penalites: [...this.penalites],
      mouvements: [...this.mouvements],
      nbCommandes: this.invoker.historique.length,
      pilotes: this.pilotes.map((p) => ({
        id: p.id,
        vitesse: p.stats.vitesse,
        controle: p.stats.controle,
        etat: p.state.nom,
        toursEtat: p.state.tours ?? 0,
      })),
    };
  }

  // Annule d'abord les commandes jouées après la sauvegarde (ce qui retire aussi
  // les malus posés entre-temps), puis réapplique le snapshot.
  restaurerEtat(etat) {
    if (!etat || etat.phase !== this.phase) return false;

    while (this.invoker.historique.length > etat.nbCommandes) {
      this.invoker.annulerDerniere();
    }

    this.tour = etat.tour;
    this.terminee = etat.terminee;
    this.ordre = [...etat.ordre];
    this.chronos = new Map(etat.chronos.map(({ id, ...chrono }) => [id, chrono]));
    this.penalites = new Map(etat.penalites);
    this.mouvements = new Map(etat.mouvements);

    etat.pilotes.forEach((snapshot) => {
      const pilote = this.getPilote(snapshot.id);
      if (!pilote) return;
      pilote.stats.vitesse = snapshot.vitesse;
      pilote.stats.controle = snapshot.controle;
      const ClasseEtat = CLASSES_ETAT[snapshot.etat] ?? NormalState;
      pilote.setState(new ClasseEtat(snapshot.toursEtat));
    });

    this.#publierClassement();
    return true;
  }

  #trier() {
    const rangActuel = new Map(this.ordre.map((id, index) => [id, index]));
    return this.pilotes
      .map((p) => p.id)
      .sort((a, b) => (this.tempsReference(a) - this.tempsReference(b))
        || (rangActuel.get(a) - rangActuel.get(b)));
  }

  #publierClassement() {
    const db = PiloteDatabase.getInstance();
    this.ordre = this.#trier();
    const tempsLeader = this.tempsReference(this.ordre[0]);

    const classement = this.ordre.map((id, index) => {
      const pilote = this.getPilote(id);
      const temps = this.tempsReference(id);
      const connu = Number.isFinite(temps);
      return {
        position: index + 1,
        id,
        pseudo: pilote.pseudo,
        numero: pilote.numero,
        image: pilote.image,
        ecurieNom: db.getEcurieById(pilote.ecurie)?.nom ?? pilote.ecurie,
        stateNom: pilote.state.nom,
        temps: connu ? temps : null,
        dernierTour: this.chronos.get(id)?.dernier ?? null,
        ecartLeader: connu && Number.isFinite(tempsLeader) ? temps - tempsLeader : null,
        mouvement: this.mouvements.get(id) ?? 0,
      };
    });

    this.dernierClassement = classement;
    this.classement.setClassement(classement);
  }
}
