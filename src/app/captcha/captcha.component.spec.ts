import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { CaptchaComponent } from './captcha.component';
import { CaptchaService } from '../core/captcha.service';
import { solve } from '../core/test-helpers';

describe('CaptchaComponent', () => {
  let fixture: ComponentFixture<CaptchaComponent>;
  let service: CaptchaService;
  let el: HTMLElement;

  const submit = async () => {
    (el.querySelector('button[type=submit]') as HTMLButtonElement).click();
    await fixture.whenStable();
  };
  const answer = async (value: string | number[]) => {
    const c = service.currentStage()!.challenge;
    if (c.type === 'image') {
      const tiles = el.querySelectorAll<HTMLButtonElement>('.tile');
      (value as number[]).forEach((i) => tiles[i].click());
    } else {
      const input = el.querySelector('input') as HTMLInputElement;
      input.value = String(value);
      input.dispatchEvent(new Event('input'));
    }
    await fixture.whenStable();
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CaptchaComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    service = TestBed.inject(CaptchaService);
    service.start();
    fixture = TestBed.createComponent(CaptchaComponent);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('shows the first stage', () => {
    expect(el.textContent).toContain('Stage 1 of 4');
  });

  it('shows a required error when submitting empty', async () => {
    await submit();
    expect(el.querySelector('.error')?.textContent).toMatch(/Please (select|enter)/);
    expect(service.currentIndex()).toBe(0);
  });

  it('shows an error on a wrong answer and stays on the stage', async () => {
    const c = service.currentStage()!.challenge;
    await answer(c.type === 'image' ? [c.tiles.findIndex((t) => !t.isTarget)] : 'zzz999');
    await submit();
    expect(el.querySelector('.error')?.textContent).toContain('Not quite');
    expect(service.currentIndex()).toBe(0);
  });

  it('advances on a correct answer and can go back', async () => {
    await answer(solve(service.currentStage()!.challenge));
    await submit();
    expect(service.currentIndex()).toBe(1);
    expect(el.textContent).toContain('Stage 2 of 4');

    (el.querySelector('.actions .btn') as HTMLButtonElement).click(); // Previous
    await fixture.whenStable();
    expect(service.currentIndex()).toBe(0);
    expect(el.querySelector('.success')).not.toBeNull();
  });

  it('navigates to results after the last stage', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    for (let i = 0; i < 4; i++) {
      await answer(solve(service.currentStage()!.challenge));
      await submit();
    }
    expect(service.isComplete()).toBe(true);
    expect(navigate).toHaveBeenCalledWith(['/result']);
  });
});
