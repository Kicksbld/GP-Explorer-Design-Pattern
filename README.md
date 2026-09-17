# TP-GP_Explorer

TP noté du cours de Design Patterns. Le but était de concevoir un système de gestion des entraînements et courses pour des pilotes du GP Explorer (Squeezie, SCH, Sylvain Lyve, etc.) en utilisant les patterns vus en cours. L'énoncé complet du prof est dans [REQUIREMENTS.md](./REQUIREMENTS.md) et la charte visuelle utilisée pour le dashboard est dans [DESIGN.md](./DESIGN.md).

Le projet est un dashboard web (voir `index.html`) qui simule une course : on fait avancer les tours, on déclenche des actions (accélérer, dépasser, utiliser une technique), on voit le classement se mettre à jour en direct, et on peut sauvegarder/restaurer l'état de la course.

## Lancer le projet

Pas de build, pas de dépendances, juste du JS natif (modules ES) chargé par le navigateur.

```bash
npm start
```

Ça lance un serveur local sur `http://localhost:5500`. Il faut ouvrir `http://localhost:5500/index.html` (pas ouvrir le fichier directement avec `file://`, sinon le `fetch` qui charge `data/db.json` ne marche pas à cause des restrictions du navigateur sur les fichiers locaux).

## Structure du projet

Chaque pattern a son propre dossier dans `src/`, un fichier = une classe = une responsabilité.

```
src/
  core/
    PiloteDatabase.js          # Singleton, accès aux données (pilotes + écuries)

  models/
    Pilote.js                  # Entité de base d'un pilote
    Ecurie.js                  # Entité écurie

  factory/
    PiloteFactory.js           # Crée la bonne sous-classe de pilote selon sa classe
    classes/
      Youtubeur.js
      Streameur.js
      Rappeur.js

  builder/
    PiloteBuilder.js           # Construit/personnalise un pilote étape par étape

  state/
    PiloteState.js             # État de base d'un pilote
    NormalState.js
    PerteAttentionState.js
    FatigueState.js
    EpuiseState.js

  observer/
    ClassementSubject.js       # Sujet observable, notifie à chaque changement de classement
    Spectator.js                # Observer concret

  decorator/
    PiloteDecorator.js         # Decorator de base
    decorators/
      BonusVitesseDecorator.js
      MalusEquipementDecorator.js

  command/                     # Bonus
    Command.js
    commands/
      AccelererCommand.js
      DepasserCommand.js
      UtiliserTechniqueCommand.js
    CourseInvoker.js           # File d'exécution des commandes + historique/undo

  composite/                   # Bonus
    EcurieComposite.js         # Regroupe les pilotes d'une écurie pour agréger leurs stats

  proxy/                       # Bonus
    DirectionCourseProxy.js    # Valide une action avant de la transmettre au moteur

  memento/                     # Bonus
    CourseCaretaker.js         # Sauvegarde/restauration de l'état d'une course

  engine/
    RaceWeekend.js             # Gère les phases essais / qualifs / course
    RaceEngine.js               # Boucle de course, fait le lien entre State, Observer, Command, Decorator

  main.js                      # Point d'entrée, branche le DOM sur le moteur
```

Les données des pilotes et écuries sont dans [data/db.json](./data/db.json).

## Patterns obligatoires

| Pattern | Fichier(s) | Rôle dans le projet |
|---|---|---|
| Singleton | `core/PiloteDatabase.js` | Point d'accès unique à la base des pilotes et écuries |
| Factory | `factory/PiloteFactory.js` | Crée un `Youtubeur`, `Streameur` ou `Rappeur` selon la classe du pilote |
| Builder | `builder/PiloteBuilder.js` | Personnalise un pilote (stats, technique, transformations) |
| State | `state/*.js` | États d'un pilote pendant la course : Normal, Perte Attention, Fatigué, Épuisé |
| Observer | `observer/*.js` | Notifie les spectateurs à chaque changement de classement |
| Decorator | `decorator/*.js` | Ajoute dynamiquement des bonus ou des mali à un pilote |

## Patterns bonus

| Pattern | Fichier(s) | Rôle dans le projet |
|---|---|---|
| Command | `command/*.js` | Encapsule les actions de course (accélérer, dépasser, technique) avec un historique et un undo |
| Composite | `composite/EcurieComposite.js` | Regroupe les pilotes d'une écurie et les traite comme un seul bloc (vitesse moyenne) |
| Proxy | `proxy/DirectionCourseProxy.js` | Fait office de direction de course : valide ou refuse une action avant qu'elle atteigne le moteur |
| Memento | `memento/*.js` | Sauvegarde l'état d'une course (tour, phase, pilotes) et permet de le restaurer |

## État du projet

Tous les patterns demandés (obligatoires et bonus) sont implémentés et fonctionnels dans le dashboard.
