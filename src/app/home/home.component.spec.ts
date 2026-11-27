import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';
import { CaptchaService } from '../core/captcha.service';

describe('HomeComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [HomeComponent], providers: [provideRouter([])] }).compileComponents();
  });

  it('starts a new session', async () => {
    const fixture = TestBed.createComponent(HomeComponent);
    await fixture.whenStable();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    (fixture.nativeElement.querySelector('.btn.primary') as HTMLButtonElement).click();
    expect(TestBed.inject(CaptchaService).hasSession()).toBe(true);
    expect(navigate).toHaveBeenCalledWith(['/captcha']);
  });

  it('offers to resume an in-progress session', async () => {
    TestBed.inject(CaptchaService).start();
    const fixture = TestBed.createComponent(HomeComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Resume challenge');
  });
});
