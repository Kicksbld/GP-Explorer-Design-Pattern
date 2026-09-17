import { PiloteDatabase } from './core/PiloteDatabase.js';
import { PiloteFactory } from './factory/PiloteFactory.js';
import { PiloteBuilder } from './builder/PiloteBuilder.js';
import { Spectator } from './observer/Spectator.js';
import { RaceEngine } from './engine/RaceEngine.js';
import { RaceWeekend } from './engine/RaceWeekend.js';

async function main() {
  const db = PiloteDatabase.getInstance();
  await db.load();

  const pilotes = db.getPilotes().map((data) => PiloteFactory.create(data));

  const engine = new RaceEngine(pilotes);
  engine.classement.subscribe(new Spectator('Tribune Principale'));

  const weekend = new RaceWeekend(engine);

  // TODO: démo — dérouler essais/qualifs/course, quelques tours, quelques techniques
}

main();
