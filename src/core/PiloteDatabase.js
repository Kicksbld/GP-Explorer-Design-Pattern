// Pattern: Singleton
// Point d'accès unique aux données de data/db.json (pilotes + ecuries).

import { readFile } from 'node:fs/promises';

const DEFAULT_DB_URL = new URL('../../data/db.json', import.meta.url);

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

  async load(url = DEFAULT_DB_URL) {
    const contenu = await readFile(url, 'utf-8');
    const { pilotes = [], ecuries = [] } = JSON.parse(contenu);
    this.#pilotes = pilotes;
    this.#ecuries = ecuries;
  }

  getPilotes() {
    return this.#pilotes;
  }

  getPiloteById(id) {
    return this.#pilotes.find((pilote) => pilote.id === id);
  }

  getEcuries() {
    return this.#ecuries;
  }

  getEcurieById(id) {
    return this.#ecuries.find((ecurie) => ecurie.id === id);
  }
}
