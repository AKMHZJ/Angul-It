import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CaptchaService } from '../core/captcha.service';

@Component({
  selector: 'app-home',
  template: `
    <section class="card center fade-in">
      <h1>Prove you're human 🤖❌</h1>
      <p class="muted">
        Complete a short series of challenges — pick images, solve a quick sum, and type a distorted code.
        Each session gets a random set of stages.
      </p>

      @if (captcha.hasSession() && !captcha.isComplete()) {
        <p>
          You have a challenge in progress
          (<strong>{{ captcha.solvedCount() }}/{{ captcha.total() }}</strong> solved).
        </p>
        <div class="actions">
          <button class="btn primary" (click)="resume()">Resume challenge</button>
          <button class="btn" (click)="startNew()">Start over</button>
        </div>
      } @else {
        <div class="actions">
          <button class="btn primary" (click)="startNew()">Start challenge</button>
        </div>
      }
    </section>
  `,
})
export class HomeComponent {
  protected readonly captcha = inject(CaptchaService);
  private readonly router = inject(Router);

  startNew(): void {
    this.captcha.start();
    this.router.navigate(['/captcha']);
  }

  resume(): void {
    this.router.navigate(['/captcha']);
  }
}
