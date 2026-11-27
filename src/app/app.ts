import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="topbar">
      <a routerLink="/" class="brand">🛡️ Angul-It</a>
    </header>
    <main id="main">
      <router-outlet />
    </main>
  `,
})
export class App {}
