# TP-GP_Explorer

TP noté du cours de Design Patterns. Le but était de concevoir un système de gestion des entraînements et courses pour des pilotes du GP Explorer (Squeezie, SCH, Sylvain Lyve, etc.) en utilisant les patterns vus en cours. L'énoncé complet du prof est dans [REQUIREMENTS.md](./REQUIREMENTS.md) et la charte visuelle utilisée pour le dashboard est dans [DESIGN.md](./DESIGN.md).

Le projet est un dashboard web (voir `index.html`) qui simule un week-end de course complet, jouable du début à la fin : on choisit son pilote, on essaie, on qualifie, on court, et le classement se met à jour en direct pendant que les 23 autres pilotes sont gérés par une petite IA.

## Lancer le projet

Pas de build, pas de dépendances, juste du JS natif (modules ES) chargé par le navigateur.

```bash
npm start
```

Ça lance un serveur local sur `http://localhost:5500`. Il faut ouvrir `http://localhost:5500/index.html` (pas ouvrir le fichier directement avec `file://`, sinon le `fetch` qui charge `data/db.json` ne marche pas à cause des restrictions du navigateur sur les fichiers locaux).

## Déroulé d'une partie

1. **Accueil** : on choisit son pilote (créé via la Factory, comme tous les autres) et un réglage de voiture (Builder : bonus vitesse ou bonus contrôle).
2. **Essais libres** puis **Qualifications** puis **Course** : trois sessions à la suite, chacune avec son nombre de tours. Le meilleur tour des qualifs fixe la grille de départ de la course.
3. À chaque tour, on choisit une action pour son pilote (s'entraîner, accélérer, dépasser, utiliser sa technique, passer au stand) pendant que l'IA choisit une action pour tous les autres pilotes. Toutes les actions, joueur comme IA, passent par la Direction de course (Proxy) avant d'atteindre le moteur.
4. Le journal de course affiche les événements en direct (dépassements, changements d'état, techniques, etc.), généré par un deuxième Observer qui compare le classement d'un tour à l'autre.
5. On peut sauvegarder/restaurer l'état de la course en cours (Memento), et à la fin de chaque phase un écran de résultats récapitule le top 3 avant de passer à la suite. Le podium final s'affiche à la fin de la course.

## Structure du projet

Chaque pattern a son propre dossier dans `src/`, un fichier = une classe = une responsabilité.

```
src/
  core/
    PiloteDatabase.js          # Singleton, accès aux données (pilotes + écuries)

  models/
    Pilote.js                  # Entité de base d'un pilote (stats, état, technique)
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
    Spectator.js                # Observer concret, affiche le classement
    Commentateur.js              # Observer concret, transforme le classement en événements de course

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
      EntrainerCommand.js
      PasserAuStandCommand.js
    CourseInvoker.js           # File d'exécution des commandes + historique/undo

  composite/                   # Bonus
    EcurieComposite.js         # Regroupe les pilotes d'une écurie pour agréger leurs stats

  proxy/                       # Bonus
    DirectionCourseProxy.js    # Valide une action avant de la transmettre au moteur

  memento/                     # Bonus
    CourseMemento.js
    CourseCaretaker.js         # Sauvegarde/restauration de l'état d'une course

  engine/
    RaceWeekend.js              # Gère les phases essais / qualifs / course
    RaceEngine.js                # Boucle de course, fait le lien entre State, Observer, Command, Decorator
    Chronometre.js               # Calcule les temps au tour à partir des stats effectives d'un pilote
    PiloteIA.js                   # Décide de l'action des pilotes non contrôlés par le joueur

  ui/                           # Rendu du dashboard, pas un pattern demandé, juste de l'affichage
    accueil.js                   # Écran d'accueil : choix du pilote et du réglage
    tableauDeBord.js             # Entête, statut de session, duel en piste, écuries
    tuilePilote.js                # Tuile du pilote suivi (stats, technique, actions)
    journal.js                    # Journal de course
    resultats.js                  # Popin de résultats de phase et podium final
    dom.js                        # Petit helper de création d'éléments DOM

  main.js                      # Point d'entrée : écran d'accueil, puis boucle du week-end
```

Les données des pilotes et écuries sont dans [data/db.json](./data/db.json).

## Patterns obligatoires

| Pattern | Fichier(s) | Rôle dans le projet |
|---|---|---|
| Singleton | `core/PiloteDatabase.js` | Point d'accès unique à la base des pilotes et écuries |
| Factory | `factory/PiloteFactory.js` | Crée un `Youtubeur`, `Streameur` ou `Rappeur` selon la classe du pilote |
| Builder | `builder/PiloteBuilder.js` | Personnalise un pilote (stats, technique, transformations) |
| State | `state/*.js` | États d'un pilote pendant la course : Normal, Perte Attention, Fatigué, Épuisé |
| Observer | `observer/*.js` | Notifie les spectateurs et le commentateur à chaque changement de classement |
| Decorator | `decorator/*.js` | Ajoute dynamiquement des bonus ou des mali à un pilote |

## Patterns bonus

| Pattern | Fichier(s) | Rôle dans le projet |
|---|---|---|
| Command | `command/*.js` | Encapsule les actions de course (accélérer, dépasser, s'entraîner, technique, stand) avec un historique et un undo |
| Composite | `composite/EcurieComposite.js` | Regroupe les pilotes d'une écurie et les traite comme un seul bloc (vitesse moyenne) |
| Proxy | `proxy/DirectionCourseProxy.js` | Fait office de direction de course : valide ou refuse une action avant qu'elle atteigne le moteur |
| Memento | `memento/*.js` | Sauvegarde l'état d'une course (tour, phase, pilotes) et permet de le restaurer |

## À propos du scénario de jeu

Tout ce qui rend le projet jouable comme un vrai petit jeu (écran d'accueil, phases essais/qualifs/course, IA qui joue à la place des autres pilotes, chronométrage, journal de course, écrans de résultats) n'était pas demandé dans l'énoncé sur les design patterns. C'est une couche que j'ai ajoutée en plus, avec l'aide d'une IA, pour avoir un dashboard complet et démontrable plutôt qu'un ensemble de classes isolées. Le cœur du TP, ce sont bien les patterns listés ci-dessus : cette couche de jeu (dossiers `engine/` et `ui/`) sert surtout de mise en situation pour les voir fonctionner ensemble.

## État du projet

Tous les patterns demandés (obligatoires et bonus) sont implémentés et fonctionnels, et le week-end de course se joue du départ des essais jusqu'au podium.
