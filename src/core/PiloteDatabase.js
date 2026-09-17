// Pattern: Singleton
// Point d'accès unique aux données de data/db.json (pilotes + ecuries).

export class PiloteDatabase {
  static #instance = null;

  #pilotes = [];
  #ecuries = [];

  constructor() {
    if (PiloteDatabase.#instance) {
      throw new Error('Utiliser PiloteDatabase.getInstance() au lieu de new PiloteDatabase()');
    }
    PiloteDatabase.#instance = this;
  }

  static getInstance() {
    if (!PiloteDatabase.#instance) {
      PiloteDatabase.#instance = new PiloteDatabase();
    }
    return PiloteDatabase.#instance;
  }

  async load(url = '/data/db.json') {
    // TODO: fetch(url) -> this.#pilotes / this.#ecuries
  }

  getPilotes() {
    return this.#pilotes;
  }

  getPiloteById(id) {
    // TODO
  }

  getEcuries() {
    return this.#ecuries;
  }

  getEcurieById(id) {
    // TODO
  }
}
