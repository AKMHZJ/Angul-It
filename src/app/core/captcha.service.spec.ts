import { TestBed } from '@angular/core/testing';
import { CaptchaService, STORAGE_KEY } from './captcha.service';
import { solve } from './test-helpers';

describe('CaptchaService', () => {
  let service: CaptchaService;

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(CaptchaService);
  });

  it('starts with no session', () => {
    expect(service.hasSession()).toBe(false);
  });

  it('starts a session and persists it', () => {
    service.start();
    expect(service.total()).toBe(4);
    expect(service.currentIndex()).toBe(0);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('records wrong attempts without solving', () => {
    service.start();
    expect(service.submit('definitely wrong')).toBe(false);
    expect(service.currentStage()?.attempts).toBe(1);
    expect(service.currentStage()?.solved).toBe(false);
  });

  it('does not allow skipping unsolved stages', () => {
    service.start();
    expect(service.goTo(1)).toBe(false);
    service.submit(solve(service.currentStage()!.challenge));
    expect(service.goTo(1)).toBe(true);
    expect(service.goTo(0)).toBe(true);
  });

  it('completes after solving every stage', () => {
    service.start();
    for (let i = 0; i < service.total(); i++) {
      service.goTo(i);
      expect(service.submit(solve(service.currentStage()!.challenge))).toBe(true);
    }
    expect(service.isComplete()).toBe(true);
    expect(service.session()?.finishedAt).not.toBeNull();
  });

  it('restores progress from localStorage (page refresh)', () => {
    service.start();
    service.submit(solve(service.currentStage()!.challenge));
    service.goTo(1);

    TestBed.resetTestingModule();
    const reloaded = TestBed.inject(CaptchaService);
    expect(reloaded.currentIndex()).toBe(1);
    expect(reloaded.solvedCount()).toBe(1);
  });

  it('ignores corrupted storage', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    TestBed.resetTestingModule();
    expect(TestBed.inject(CaptchaService).hasSession()).toBe(false);
  });

  it('reset clears the session', () => {
    service.start();
    service.reset();
    expect(service.hasSession()).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
