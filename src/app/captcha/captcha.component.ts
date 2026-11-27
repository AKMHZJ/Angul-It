import { Component, computed, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CaptchaService } from '../core/captcha.service';
import { Answer } from '../core/challenge.model';

/** Required validator that understands both strings and tile selections. */
export function answerRequired(control: AbstractControl): ValidationErrors | null {
  const v = control.value;
  const empty = v == null || (Array.isArray(v) ? v.length === 0 : String(v).trim() === '');
  return empty ? { required: true } : null;
}

@Component({
  selector: 'app-captcha',
  imports: [ReactiveFormsModule],
  templateUrl: './captcha.component.html',
})
export class CaptchaComponent {
  protected readonly captcha = inject(CaptchaService);
  private readonly router = inject(Router);

  protected readonly control = new FormControl<Answer | null>(null, answerRequired);
  protected readonly form = new FormGroup({ answer: this.control });
  protected submitted = false;

  protected readonly stage = this.captcha.currentStage;
  protected readonly index = this.captcha.currentIndex;
  protected readonly progress = computed(() => Math.round((this.captcha.solvedCount() / this.captcha.total()) * 100));

  constructor() {
    this.syncForm();
  }

  protected get selected(): number[] {
    return Array.isArray(this.control.value) ? this.control.value : [];
  }

  protected toggleTile(i: number): void {
    if (this.control.disabled) return;
    const sel = this.selected;
    this.control.setValue(sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i]);
    this.control.markAsTouched();
  }

  /** Stable pseudo-random distortion per character so it survives re-renders. */
  protected charStyle(code: string, i: number): Record<string, string> {
    const seed = code.charCodeAt(i) * 31 + i * 17;
    return {
      transform: `rotate(${(seed % 50) - 25}deg) translateY(${(seed % 11) - 5}px)`,
      color: `hsl(${(seed * 7) % 360} 60% 40%)`,
    };
  }

  protected submit(): void {
    const stage = this.stage();
    if (!stage) return;

    if (stage.solved) {
      this.next();
      return;
    }

    this.submitted = true;
    this.control.markAsTouched();
    if (this.control.invalid) return;

    if (this.captcha.submit(this.control.value as Answer)) {
      this.next();
    } else {
      this.control.setErrors({ incorrect: true });
    }
  }

  protected previous(): void {
    if (this.captcha.goTo(this.index() - 1)) this.syncForm();
  }

  protected refresh(): void {
    this.captcha.refreshCurrent();
    this.syncForm();
  }

  private next(): void {
    if (this.captcha.isComplete() && this.index() === this.captcha.total() - 1) {
      this.router.navigate(['/result']);
      return;
    }
    if (this.captcha.goTo(this.index() + 1)) this.syncForm();
  }

  private syncForm(): void {
    const stage = this.stage();
    this.submitted = false;
    const empty: Answer = stage?.challenge.type === 'image' ? [] : '';
    this.control.reset(stage?.solved ? stage.answer : empty);
    if (stage?.solved) this.control.disable();
    else this.control.enable();
  }
}
