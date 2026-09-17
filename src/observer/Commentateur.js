// Observer concret : compare chaque classement reçu au précédent et en tire
// des événements de course (dépassements, changements d'état) pour le journal.

const MAX_NOMS = 6;

export class Commentateur {
  #precedent = null; // Map id -> entrée du classement précédent
  #toursBouclesVus = 0;

  constructor(engine, { onEvenement, estSuivi = () => false }) {
    this.engine = engine;
    this.onEvenement = onEvenement;
    this.estSuivi = estSuivi;
  }

  // le prochain classement reçu sert de référence sans rien annoncer
  // (nouvelle session, restauration, annulation)
  reinitialiser() {
    this.#precedent = null;
  }

  update(classement) {
    const toursBoucles = this.engine.toursBoucles;
    const tourBoucle = toursBoucles !== this.#toursBouclesVus;

    if (this.#precedent) {
      this.#annoncerEtats(classement, tourBoucle ? toursBoucles : this.engine.tour);
      if (tourBoucle) {
        this.#annoncerDepassements(classement, toursBoucles);
      }
    }

    this.#precedent = new Map(classement.map((entree) => [entree.id, entree]));
    this.#toursBouclesVus = toursBoucles;
  }

  #annoncerEtats(classement, tour) {
    const parEtat = new Map();
    classement.forEach((entree) => {
      const avant = this.#precedent.get(entree.id);
      if (!avant || avant.stateNom === entree.stateNom) return;
      if (!parEtat.has(entree.stateNom)) parEtat.set(entree.stateNom, []);
      parEtat.get(entree.stateNom).push(entree.pseudo);
    });

    parEtat.forEach((pseudos, etat) => {
      if (pseudos.length <= 3) {
        pseudos.forEach((pseudo) => this.onEvenement({ tour, type: 'État', texte: `${pseudo} passe en`, etat }));
        return;
      }
      const reste = pseudos.length - MAX_NOMS;
      const noms = pseudos.slice(0, MAX_NOMS).join(', ') + (reste > 0 ? ` et ${reste} autres` : '');
      this.onEvenement({ tour, type: 'État', texte: `${pseudos.length} pilotes passent en`, etat, suite: `: ${noms}.` });
    });
  }

  // on ne commente que ce qui compte : nouveau leader, entrée sur le podium
  // provisoire et tout mouvement du pilote suivi par le joueur
  #annoncerDepassements(classement, tour) {
    const ancienLeader = [...this.#precedent.values()].find((entree) => entree.position === 1);

    classement.forEach((entree) => {
      const avant = this.#precedent.get(entree.id);
      if (!avant) return;
      const gain = avant.position - entree.position;
      if (gain === 0) return;
      const places = `${Math.abs(gain)} place${Math.abs(gain) > 1 ? 's' : ''}`;

      if (gain > 0 && entree.position === 1) {
        this.onEvenement({ tour, type: 'Dépassement', texte: `${entree.pseudo} prend la tête devant ${ancienLeader?.pseudo ?? 'le peloton'}.` });
      } else if (gain > 0 && entree.position <= 3) {
        this.onEvenement({ tour, type: 'Dépassement', texte: `${entree.pseudo} remonte en P${entree.position} (+${places}).` });
      } else if (this.estSuivi(entree.id)) {
        const verbe = gain > 0 ? 'gagne' : 'perd';
        this.onEvenement({ tour, type: 'Classement', texte: `${entree.pseudo} ${verbe} ${places} et passe P${entree.position}.` });
      }
    });
  }
}
