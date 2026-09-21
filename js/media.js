/**
 * Video behaviour shared by every clip on the page.
 *
 * Two jobs.
 *
 * **Lazy start.** `mediaCard()` renders each clip with `preload="none"` and no
 * `autoplay`, so the browser fetches nothing until a group nears the viewport.
 * Thirty-two clips — tens of megabytes of footage — would otherwise all be
 * requested while the reader is still on the hero.
 *
 * **Lockstep.** Every side-by-side group is a comparison: TWIST2 against SONIC,
 * success against failure, base against perturbed, or one episode from three
 * cameras. A comparison is only readable if both sides show the same moment, so a
 * group runs as one clip: it waits for its longest member to finish, holding the
 * finished ones on their last frame, and only then starts every member over
 * together. The clips differ a lot — the Football success/failure pair is 20.8s
 * against 64.0s — so without this the short side has looped three times while the
 * long side is still on its first pass.
 *
 * Runs after `renderPage()`, so the elements it looks for already exist.
 */

/** Every side-by-side set of clips: task and scenario rows, example pairs, pipeline grids. */
const GROUPS = ".task-media-pair, .example-video-pair, .inline-media-grid";

/** Shimmer over a clip until its first frame is ready. */
function addLoader(card, video) {
  const loader = document.createElement("div");
  loader.className = "media-loader";
  card.appendChild(loader);

  const hide = () => loader.classList.add("loaded");
  if (video.readyState >= 2) {
    hide();
  } else {
    // A clip that fails resolves the placeholder too, leaving the layout intact.
    video.addEventListener("loadeddata", hide);
    video.addEventListener("error", hide);
  }
}

/**
 * One set of clips that play as a unit. Returns `{ entered, left }` so the
 * observer only has to say whether the set is on screen.
 */
function createGroup(element) {
  const videos = Array.from(element.querySelectorAll("video"));
  if (!videos.length) return null;

  // The shared restart replaces the per-clip loop, so turn that off.
  videos.forEach((video) => {
    video.loop = false;
  });

  let onScreen = false;
  let finished = 0;

  const restart = () => {
    finished = 0;
    videos.forEach((video) => {
      video.currentTime = 0;
    });
    if (onScreen) {
      videos.forEach((video) => video.play().catch(() => {}));
    }
  };

  const markFinished = () => {
    finished += 1;
    if (finished >= videos.length) restart();
  };

  videos.forEach((video) => {
    video.addEventListener("ended", markFinished);
    // A clip that cannot load must not hold the whole set open for ever.
    video.addEventListener("error", markFinished);
  });

  const playAll = () => {
    videos.forEach((video) => video.play().catch(() => {}));
  };

  return {
    entered() {
      onScreen = true;
      // An already-finished clip restarts by itself when played, which would
      // strand its partners mid-cycle, so the whole set starts over instead.
      if (videos.some((video) => video.ended)) restart();
      else playAll();
    },
    left() {
      onScreen = false;
      // Scrolling past dozens of playing clips would otherwise keep decoding all
      // of them; they resume where they stopped.
      videos.forEach((video) => video.pause());
    },
  };
}

export function startMedia() {
  const cards = Array.from(document.querySelectorAll(".media-card"));
  cards.forEach((card) => {
    const video = card.querySelector("video");
    if (video) addLoader(card, video);
  });

  // One observer target per set. A clip that sits outside any set is watched on
  // its own, so it still starts and stops with the viewport.
  const watched = new Set();
  cards.forEach((card) => {
    const group = card.closest ? card.closest(GROUPS) : null;
    watched.add(group || card);
  });

  const groups = new Map();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!groups.has(entry.target)) groups.set(entry.target, createGroup(entry.target));

        const group = groups.get(entry.target);
        if (!group) return;

        if (entry.isIntersecting) group.entered();
        else group.left();
      });
    },
    { rootMargin: "200px 0px" }
  );

  watched.forEach((target) => observer.observe(target));
}
