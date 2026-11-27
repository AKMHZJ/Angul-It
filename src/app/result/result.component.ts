import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CaptchaService } from '../core/captcha.service';

const LABELS = { image: '🖼️ Image selection', math: '➗ Math problem', text: '🔤 Text code' } as const;

@Component({
  selector: 'app-result',
  template: `
    <section class="card fade-in">
      <h1>All challenges complete 🎉</h1>
      <p class="muted">You've been verified as human.</p>

      <div class="stats">
        <div class="stat"><strong>{{ stages().length }}</strong><span>stages</span></div>
        <div class="stat"><strong>{{ totalAttempts() }}</strong><span>attempts</span></div>
        <div class="stat"><strong>{{ accuracy() }}%</strong><span>first-try accuracy</span></div>
        <div class="stat"><strong>{{ duration() }}s</strong><span>time taken</span></div>
      </div>

      <table class="summary">
        <thead><tr><th>#</th><th>Challenge</th><th>Attempts</th><th>Result</th></tr></thead>
        <tbody>
          @for (s of stages(); track $index) {
            <tr>
              <td>{{ $index + 1 }}</td>
              <td>{{ labels[s.challenge.type] }}</td>
              <td>{{ s.attempts }}</td>
              <td>{{ s.attempts === 1 ? '✓ First try' : '✓ Solved' }}</td>
            </tr>
          }
        </tbody>
      </table>

      <div class="actions">
        <button class="btn primary" (click)="restart()">Restart Challenge</button>
      </div>
    </section>
  `,
})
export class ResultComponent {
  private readonly captcha = inject(CaptchaService);
  private readonly router = inject(Router);

  protected readonly labels = LABELS;
  protected readonly stages = computed(() => this.captcha.session()?.stages ?? []);
  protected readonly totalAttempts = computed(() => this.stages().reduce((n, s) => n + s.attempts, 0));
  protected readonly accuracy = computed(() => {
    const st = this.stages();
    return st.length ? Math.round((st.filter((s) => s.attempts === 1).length / st.length) * 100) : 0;
  });
  protected readonly duration = computed(() => {
    const s = this.captcha.session();
    return s?.finishedAt ? Math.round((s.finishedAt - s.startedAt) / 1000) : 0;
  });

  restart(): void {
    this.captcha.start();
    this.router.navigate(['/captcha']);
  }
}
