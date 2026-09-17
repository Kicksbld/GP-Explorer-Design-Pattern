# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TP-GP_Explorer is a graded school assignment ("TP noté") for a Design Patterns course. It's a browser-only JS simulation of a race management system ("GP Explorer") where "pilotes" (based on French YouTubers/streamers/rappers) train and race, rendered as a live dashboard in `index.html`. The full assignment brief is in [REQUIREMENTS.md](./REQUIREMENTS.md); the visual style guide (cloned from gp-explorer.fr) is in [DESIGN.md](./DESIGN.md).

The point of the project is to demonstrate correct, explicit implementations of specific GoF patterns — see the pattern table below before changing `src/`. New code should stay inside the pattern responsible for that behavior rather than special-casing logic elsewhere (e.g. new pilote stat effects belong in a State/Decorator, not inline in `RaceEngine`).

## Commands

No build step, no bundler, no test suite — plain ES modules loaded directly by the browser.

```bash
npm start   # serves the project at http://localhost:5500 via `python3 -m http.server 5500`
```

Open `http://localhost:5500/index.html` after starting the server (opening `index.html` directly via `file://` will break the `fetch('./data/db.json')` call in `PiloteDatabase`).

## Architecture

Entry point: [src/main.js](./src/main.js) — wires up the singleton DB, builds pilotes via the factory, constructs a `RaceEngine`/`RaceWeekend`, and binds all DOM event listeners (`data-action="..."` attributes in `index.html`) to engine calls. There is no framework; DOM updates are hand-written `document.querySelector` + `replaceChildren` renders, one function per dashboard section (phase stepper, command history, écurie list, direction-control log), each called after any state-mutating action.

Data flows one-way: `data/db.json` (raw pilote/écurie records) → `PiloteDatabase` (Singleton, fetched once) → `PiloteFactory.create()` (Factory, picks the `Youtubeur`/`Streameur`/`Rappeur` subclass per `classe`) → `PiloteBuilder` (optional, for stat customization) → `RaceEngine`, which owns the live pilote array and is the hub every other pattern plugs into:

| Pattern | File(s) | Role |
|---|---|---|
| Singleton | `core/PiloteDatabase.js` | Single source of truth for pilotes + écuries, loaded via `fetch` |
| Factory | `factory/PiloteFactory.js`, `factory/classes/*.js` | Instantiates the right `Pilote` subclass from `classe` |
| Builder | `builder/PiloteBuilder.js` | Step-by-step pilote customization (stats, technique, transformations) |
| State | `state/PiloteState.js` + `Normal/PerteAttention/Fatigue/Epuise` | Pilote condition during a race; swapped via `pilote.setState()` |
| Observer | `observer/ClassementSubject.js`, `observer/Spectator.js` | `RaceEngine` republishes the sorted classement to subscribers on every mutation |
| Decorator | `decorator/PiloteDecorator.js` + `decorators/*.js` | Wraps a `Pilote` to add bonuses/mali (e.g. technique effects); `RaceEngine.remplacerPilote` swaps the decorated instance back into the live array |
| Command *(bonus)* | `command/Command.js`, `command/commands/*.js`, `command/CourseInvoker.js` | Race actions (accelerate/pass/technique) as objects with undo history |
| Composite *(bonus)* | `composite/EcurieComposite.js` | Groups a team's pilotes to aggregate stats (e.g. average speed) |
| Proxy *(bonus)* | `proxy/DirectionCourseProxy.js` | Validates/authorizes a Command before it reaches `RaceEngine.executer`; refusals are logged to `verdicts`, not the command history |
| Memento *(bonus)* | `memento/CourseCaretaker.js` | Snapshot/restore of race state; `main.js`'s `capturerEtat`/`restaurerEtat` do the (de)serialization since state must stay `structuredClone`-safe (raw data, never live `Pilote`/`State` instances) |

`engine/RaceEngine.js` and `engine/RaceWeekend.js` are the orchestration layer: `RaceEngine` advances turns, executes commands through the invoker, and republishes the classement (Observer) after every mutation; `RaceWeekend` tracks the essais → qualifs → course phase separately from the engine's turn counter.

Actions triggered from the UI go through `DirectionCourseProxy` before reaching the engine (see `executerViaDirection` in `main.js`) — don't call `engine.executer()` directly from UI handlers, or the direction-control validation/logging is bypassed.

## Styling

`design-system/variables.css`, `components.css`, `dashboard.css` implement the visual language documented in [DESIGN.md](./DESIGN.md) (flat/angular motorsport-broadcast aesthetic, zero border-radius, red gradient accents). Follow DESIGN.md's tokens rather than introducing new colors/spacing ad hoc.
