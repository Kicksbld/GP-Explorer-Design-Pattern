# TP Noté — GP Explorer
## Système de gestion des entraînements et courses

## Contexte

Concevoir un système de gestion des entraînements et courses pour des pilotes du GP Explorer.
Les pilotes (Squezzi, SCH, Sylvain Lyve, etc.) doivent améliorer leurs compétences au fil des
entraînements, suivre des entraînements rigoureux, et participer à des courses.

## Spécifications générales

### 1. Gestion des pilotes et des courses

- Chaque pilote doit suivre des entraînements pour améliorer ses compétences.
- Les pilotes peuvent participer à des courses.
- Les pilotes possèdent des techniques uniques (Keep Pushing, C'est Ciao, Le Marseille bébé, etc.).
- Le système doit permettre aux pilotes de progresser et d'améliorer leurs stats.

### 2. Patterns obligatoires

| Pattern | Rôle dans le TP |
|---|---|
| **Singleton** | Gestionnaire centralisé de la base de données des pilotes. |
| **Factory** | Créer des pilotes avec des classes spécifiques (Youtubeur, Streameur, Rappeur). |
| **Builder** | Personnaliser les pilotes avec différentes compétences et transformations. |
| **State** | Gérer les états des pilotes pendant les courses (`Normal`, `Perte Attention`, `Fatigué`, `Épuisé`). |
| **Observer** | Notifier les spectateurs lors d'événements clés (changement du classement pendant la course). |
| **Decorator** | Ajouter dynamiquement des bonus ou équipements aux pilotes. |

## Fonctionnalités avancées (Bonus)

1. Système de course avec le **Command Pattern**.
2. Gestion des écuries avec le **Composite Pattern**.
3. Contrôle de la direction de course avec le **Proxy Pattern**.
4. Sauvegarde des courses avec le **Memento Pattern**.
5. Phases du week-end de course (essais, qualifs, course).
6. Alliance entre écuries contre un boss (Karchez).

## Barème

| Critère | Points |
|---|---|
| Implémentation des patterns obligatoires | 8 pts |
| Complexité et pertinence du code | 4 pts |
| Présentation et démonstration orale | 6 pts |
| Bonus (patterns avancés) | jusqu'à 2 pts |
| **Total** | **20 pts** |

## Conseils

- Faire en sorte que les courses soient dynamiques et fidèles à l'univers du GP Explorer.
- Penser à la modularité pour que de nouveaux pilotes ou techniques puissent être ajoutés facilement.
- Se préparer à expliquer comment chaque pattern améliore la gestion des pilotes et des courses.

## Livrables

1. **Code source** : Projet complet avec les design patterns implémentés. (Sur Teams, dans un dossier `TP_Note_Nom_Prenom`)
2. **Présentation orale** : Explication des patterns, démonstration et justification des choix.
3. **Documentation** (optionnelle mais recommandée).
