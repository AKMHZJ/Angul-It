# Angul-It

A multi-stage CAPTCHA single-page app built with Angular (standalone components, signals, reactive forms).

## Features
- **Random sessions** – 4 stages per session covering image selection, math, and distorted-text challenges in random order.
- **Validation** – each stage must be answered correctly before advancing; clear error messages and hints.
- **Navigation** – Previous / Next between stages; you can't skip ahead of the first unsolved stage.
- **Persistence** – progress is saved in `localStorage` and restored on refresh.
- **Access control** – `/captcha` requires an active session; `/result` redirects to the current challenge until all stages are solved.
- **Results** – attempts, first-try accuracy, time taken, and a *Restart Challenge* button.
- Responsive, keyboard-accessible, light/dark themes, slide-in transitions (respects reduced motion).

## Structure
```
src/app/
  core/       challenge model + generator, CaptchaService (state), route guards
  home/       HomeComponent    – intro, start / resume
  captcha/    CaptchaComponent – challenge interface
  result/     ResultComponent  – summary + restart
```

## Run
```bash
npm install
npm start          # http://localhost:4200
npm test -- --watch=false
npm run build
```
