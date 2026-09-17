# TP-GP_Explorer

Système de gestion des entraînements et courses pour les pilotes du GP Explorer — TP noté sur les design patterns. Voir [REQUIREMENTS.md](./REQUIREMENTS.md) pour le sujet complet et [DESIGN.md](./DESIGN.md) pour la charte visuelle.

## Architecture

Le code logique vit dans `src/`, un fichier = une classe = une responsabilité. Les données des pilotes/écuries sont dans [data/db.json](./data/db.json).

```
src/
  core/
    PiloteDatabase.js          # Singleton — accès unique aux données (pilotes + écuries)

  models/
    Pilote.js                  # Entité de base (id, pseudo, technique, stats, state)
    Ecurie.js                  # Entité écurie

  factory/
    PiloteFactory.js           # Factory — instancie la bonne sous-classe selon `classe`
    classes/
      Youtubeur.js
      Streameur.js
      Rappeur.js

  builder/
    PiloteBuilder.js           # Builder — personnalise un pilote étape par étape

  state/
    PiloteState.js             # État de base
    NormalState.js
    PerteAttentionState.js
    FatigueState.js
    EpuiseState.js

  observer/
    ClassementSubject.js       # Sujet observable - notifie à chaque changement de classement
    Spectator.js                # Observer concret

  decorator/
    PiloteDecorator.js         # Decorator de base
    decorators/
      BonusVitesseDecorator.js
      MalusEquipementDecorator.js

  command/                     # Bonus — Command Pattern
    Command.js
    commands/
      AccelererCommand.js
      DepasserCommand.js
      UtiliserTechniqueCommand.js
    CourseInvoker.js           # File d'exécution + historique/undo

  composite/                   # Bonus — Composite Pattern
    EcurieComposite.js         # Agrège plusieurs Pilote sous l'interface d'une écurie

  proxy/                       # Bonus — Proxy Pattern
    DirectionCourseProxy.js    # Valide une action avant de la déléguer

  memento/                     # Bonus — Memento Pattern
    CourseMemento.js
    CourseCaretaker.js         # Sauvegarde/restauration de l'état d'une course

  engine/
    RaceWeekend.js             # Orchestre les phases essais / qualifs / course
    RaceEngine.js               # Boucle de course, relie State + Observer + Command + Decorator

  main.js                       # Point d'entrée / démo
```

## Correspondance patterns → rôle dans le jeu

| Pattern | Fichier(s) | Rôle |
|---|---|---|
| Singleton | `core/PiloteDatabase.js` | Gestionnaire centralisé de la base des pilotes |
| Factory | `factory/PiloteFactory.js` | Crée un `Youtubeur` / `Streameur` / `Rappeur` selon la classe |
| Builder | `builder/PiloteBuilder.js` | Personnalise un pilote (stats, technique, transformations) |
| State | `state/*.js` | États d'un pilote en course : Normal, Perte Attention, Fatigué, Épuisé |
| Observer | `observer/*.js` | Notifie les spectateurs à chaque changement de classement |
| Decorator | `decorator/*.js` | Ajoute dynamiquement bonus/malus/équipements à un pilote |
| Command *(bonus)* | `command/*.js` | Actions de course encapsulées (accélérer, dépasser, technique), avec historique |
| Composite *(bonus)* | `composite/EcurieComposite.js` | Regroupe les pilotes d'une écurie, traités comme un tout |
| Proxy *(bonus)* | `proxy/DirectionCourseProxy.js` | Contrôle/valide les actions avant exécution (direction de course) |
| Memento *(bonus)* | `memento/*.js` | Sauvegarde et restauration de l'état d'une course |

## État du code

Les fichiers de `src/` sont pour l'instant des **squelettes** (classes et méthodes stubées avec `// TODO`) : la structure et les responsabilités sont posées, la logique métier (effets des techniques, calcul du classement, transitions d'état) reste à implémenter.

Point d'entrée : [src/main.js](./src/main.js).
# GP-Explorer-Design-Pattern
