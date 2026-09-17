import { Command } from '../Command.js';

// Passe par engine.executerTechnique() pour profiter du Decorator et de l'Observer.
// L'undo restaure juste un snapshot des stats/état pris avant l'effet.
export class UtiliserTechniqueCommand extends Command {
  #snapshot = null;

  constructor(engine, pilote, cible = null) {
    super();
    this.engine = engine;
    this.pilote = pilote;
    this.cible = cible;
  }

  execute() {
    this.#snapshot = {
      etatPilote: this.pilote.state,
      statsPilote: { ...this.pilote.stats },
      etatCible: this.cible?.state,
      statsCible: this.cible ? { ...this.cible.stats } : null,
    };
    this.engine.executerTechnique(this.pilote, this.cible);
  }

  undo() {
    if (!this.#snapshot) return;
    const { etatPilote, statsPilote, etatCible, statsCible } = this.#snapshot;

    Object.assign(this.pilote.stats, statsPilote);
    this.pilote.setState(etatPilote);

    if (this.cible) {
      Object.assign(this.cible.stats, statsCible);
      this.cible.setState(etatCible);
      // remet la version décorée de la cible dans le moteur si besoin
      const actuel = this.engine.pilotes.find((p) => p.id === this.cible.id);
      if (actuel && actuel !== this.cible) {
        this.engine.remplacerPilote(actuel, this.cible);
      }
    }
  }

  get label() {
    const nom = this.pilote.technique?.nom ?? 'technique';
    return this.cible ? `Utiliser ${nom} sur ${this.cible.pseudo}` : `Utiliser ${nom}`;
  }
}
