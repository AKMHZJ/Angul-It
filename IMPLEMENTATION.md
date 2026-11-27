# Angul-It — Implementation Notes & Usage

This document describes what was built for the Angul-It project (see `angul-it.md` for the original subject) and how to use it.

---

## 1. What was done

### Setup
- Created the project with the Angular CLI (Angular 22, standalone components, zoneless change detection, Vitest for unit tests).
- No UI library and no external CAPTCHA library: styling is plain CSS (`src/styles.css`) and all challenge logic is custom.

### Project structure
```
src/
  styles.css                      Global styles: theme colors, layout, responsive rules, animations
  app/
    app.ts                        Root component (header + <router-outlet>)
    app.routes.ts                 Routes and guards
    app.config.ts                 Application providers (router)
    core/
      challenge.model.ts          Types: Challenge, StageState, SessionState
      challenge.generator.ts      Random challenge creation + answer checking (isCorrect)
      captcha.service.ts          State management (signals + localStorage)
      guards.ts                   captchaGuard, resultGuard
      test-helpers.ts             solve() helper used only by tests
    home/home.component.ts        HomeComponent – intro, start / resume
    captcha/captcha.component.*   CaptchaComponent – challenge interface + form validation
    result/result.component.ts    ResultComponent – summary + restart
```

### Core components
| Component | Route | Role |
|---|---|---|
| `HomeComponent` | `/` | Introduces the app. Shows **Start challenge**, or **Resume challenge** / **Start over** when a session is in progress. |
| `CaptchaComponent` | `/captcha` | Shows the current stage, progress bar, Previous / Verify / Next buttons, and error messages. |
| `ResultComponent` | `/result` | Summary table, stats, and a **Restart Challenge** button. |

### CAPTCHA challenges
Each session has **4 stages**: one of each type plus one extra random type, in shuffled order (`createSession()`).

| Type | What the user does | How it is checked |
|---|---|---|
| Image selection | Select every tile matching the prompt (cat, dog, car or fruit) in a 3×3 grid | Selected tiles must match the target tiles exactly |
| Math | Solve a small `+`, `−` or `×` problem | Numeric equality |
| Text | Type a 5-character distorted code | Trimmed, case-insensitive match |

A **↻ New challenge** button replaces the current unsolved stage with a new one of the same type.

### Form validation
- Reactive Forms (`FormGroup` + `FormControl`) with a custom `answerRequired` validator that handles both text input and tile selection.
- Submitting an empty answer shows *"Please enter an answer"* / *"Please select at least one image"*.
- A wrong answer sets an `incorrect` error, shows *"Not quite — try again"* plus a hint, and counts an attempt.
- The user cannot advance until the stage is solved.

### Navigation rules
- **Previous** is always allowed (except on stage 1). Solved stages are shown as read-only with *"✓ Stage solved"*.
- Moving forward is limited to the first unsolved stage (`CaptchaService.goTo()` enforces this).
- All navigation uses the Angular router; there are no full page reloads.

### State management
- `CaptchaService` holds the session in an Angular **signal** and writes it to `localStorage` (key `angul-it.session`) after every change.
- On startup the service reads the saved session back, so refreshing the page resumes at the same stage with the same progress.
- Corrupted or invalid saved data is ignored, and the user simply starts fresh.

### Access control (route guards)
- `captchaGuard`: `/captcha` without a session → redirect to `/`.
- `resultGuard`: `/result` before all stages are solved → redirect to `/captcha` (or `/` if there is no session).
- Unknown URLs redirect to `/`.

### Results page
Shows the number of stages, the total attempts, the first-try accuracy (%), the time taken, and a per-stage table. **Restart Challenge** creates a new random session and goes to `/captcha`.

### UI / UX
- Responsive layout: a single centered card; the stats grid switches from 4 to 2 columns and the buttons stretch on phones (≤ 480px).
- Accessibility: labelled inputs, `aria-pressed` on image tiles, `aria-live` feedback messages, a progress bar with ARIA values, and visible focus outlines.
- Automatic light and dark theme (`prefers-color-scheme`).
- Slide-in animation between stages; animations are turned off when the user prefers reduced motion.

### Bonus items covered
- ✅ Random set of mixed challenge types per session
- ✅ Animated transitions between challenges
- ✅ Responsive on desktop and mobile
- ✅ Unit tests for components, the service, the guards and the generator

### Unit tests (24 tests, all passing)
| File | Covers |
|---|---|
| `core/challenge.generator.spec.ts` | Session composition and answer checking for every challenge type |
| `core/captcha.service.spec.ts` | Start, wrong attempts, no skipping, completion, restore after refresh, corrupted storage, reset |
| `core/guards.spec.ts` | Redirects for both guards |
| `captcha/captcha.component.spec.ts` | Required error, wrong-answer error, advancing, Previous, navigating to results |
| `result/result.component.spec.ts` | Summary rendering, accuracy, restart |
| `home/home.component.spec.ts` | Start and resume |
| `app.spec.ts` | Root component renders |

### Known limitation
This is a frontend-only CAPTCHA: the correct answers are stored in the browser (`localStorage`), so someone using the developer tools could read them. A production CAPTCHA would generate and verify challenges on a server.

---

## 2. Usage

### Requirements
- Node.js 20.19+ (developed with Node 26)
- npm

### Install
```bash
npm install
```

### Run the app
```bash
npm start
```
Then open http://localhost:4200.

### Run the unit tests
```bash
npm test -- --watch=false
```

### Production build
```bash
npm run build
```
The output goes to `dist/angul-it/`.

### Walkthrough (live demo)
1. Open `/` and click **Start challenge**.
2. Solve each stage and click **Verify**. Try submitting empty or wrong answers to see the validation messages.
3. Use **← Previous** to go back to a solved stage, then **Next →** to return.
4. Refresh the page in the middle of the challenge: you come back to the same stage with your progress kept.
5. Type `/result` in the address bar before finishing: you are redirected to `/captcha`.
6. Finish all stages to see the results page, then click **Restart Challenge** for a new random set.
7. To clear all saved progress manually, delete the `angul-it.session` key from `localStorage` in the browser dev tools.
