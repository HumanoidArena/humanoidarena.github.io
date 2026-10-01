import { expect, test } from "@playwright/test";

import { createClipGroup } from "../js/media.js";

/**
 * The clip-group state machine, tested with doubles rather than a real browser: the behaviour
 * worth pinning down is which clips a restart waits for, and reaching that state for real needs
 * a browser that can decode H.264 — Playwright's bundled Chromium cannot.
 */

/** A clip that records what it was told to do, and can be played to its end or broken. */
function fakeClip() {
  const listeners = new Map();
  let currentTime = 7;
  let ended = false;

  return {
    loop: true,
    playing: false,
    playCount: 0,

    get currentTime() {
      return currentTime;
    },
    // Rewinding clears `ended`, as it does on a real element.
    set currentTime(value) {
      currentTime = value;
      if (value === 0) ended = false;
    },
    get ended() {
      return ended;
    },

    /** Play through to the end. */
    finish() {
      currentTime = 9;
      ended = true;
      for (const handler of listeners.get("ended") || []) handler();
    },
    /** Fail to load. */
    break_() {
      for (const handler of listeners.get("error") || []) handler();
    },

    addEventListener(type, handler) {
      listeners.set(type, [...(listeners.get(type) || []), handler]);
    },
    play() {
      this.playCount += 1;
      this.playing = true;
      return Promise.resolve();
    },
    pause() {
      this.playing = false;
    },
  };
}

test("waits for every clip, then starts them over together", () => {
  const a = fakeClip();
  const b = fakeClip();
  const group = createClipGroup([a, b]);
  group.entered();

  expect([a.playing, b.playing]).toEqual([true, true]);

  // The first to finish must not rewind on its own.
  a.finish();
  expect(a.currentTime).toBe(9);
  expect(b.playing).toBe(true);

  // The second finishing is what starts the pair over.
  b.finish();
  expect(a.currentTime).toBe(0);
  expect(b.currentTime).toBe(0);
  expect([a.playing, b.playing]).toEqual([true, true]);
});

test("a clip that failed to load does not hold the group open", () => {
  const doomed = fakeClip();
  const survivor = fakeClip();
  const group = createClipGroup([doomed, survivor]);
  group.entered();

  doomed.break_();

  // Two cycles: counting the failure once is not enough, because the dead clip never
  // reports again and would leave the survivor frozen on its last frame.
  for (let cycle = 1; cycle <= 2; cycle += 1) {
    survivor.currentTime = 5;
    survivor.finish();
    expect(survivor.currentTime, `cycle ${cycle}`).toBe(0);
    expect(survivor.playing, `cycle ${cycle}`).toBe(true);
  }
});

test("leaving the viewport stops the clips and returning resumes them", () => {
  const a = fakeClip();
  const b = fakeClip();
  const group = createClipGroup([a, b]);

  group.entered();
  group.left();
  expect([a.playing, b.playing]).toEqual([false, false]);

  const plays = [a.playCount, b.playCount];
  group.entered();
  expect([a.playing, b.playing]).toEqual([true, true]);
  expect([a.playCount, b.playCount]).toEqual([plays[0] + 1, plays[1] + 1]);
});

test("a finished clip makes the whole set start over when it comes back into view", () => {
  const a = fakeClip();
  const b = fakeClip();
  const group = createClipGroup([a, b]);
  group.entered();

  a.finish();
  group.left();
  group.entered();

  // Playing an ended clip restarts it on its own, which would strand its partner mid-cycle.
  expect(a.currentTime).toBe(0);
  expect(b.currentTime).toBe(0);
});
