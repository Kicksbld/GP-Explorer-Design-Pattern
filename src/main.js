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

  // TODO (étape RaceEngine) : dérouler essais/qualifs/course via weekend/engine.tourSuivant()
  // En attendant, on pousse un premier classement pour vérifier l'Observer sur le dashboard :
  const classement = pilotes
    .slice()
    .sort((a, b) => b.getVitesse() - a.getVitesse())
    .map((p, index) => ({
      position: index + 1,
      id: p.id,
      pseudo: p.pseudo,
      numero: p.numero,
      image: p.image,
      ecurieNom: db.getEcurieById(p.ecurie)?.nom ?? p.ecurie,
      stateNom: p.state.nom,
    }));
  engine.classement.setClassement(classement);
}

main();
