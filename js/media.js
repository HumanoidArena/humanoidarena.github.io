/**
 * Video behaviour for every clip on the page.
 *
 * Clips are fetched lazily: `mediaCard()` renders each with `preload="none"` and no
 * `autoplay`, and this starts a clip as it nears the viewport. Side by side clips are
 * also one unit — the set waits for its longest clip to finish, holding the finished
 * ones on their last frame, then starts every clip over together.
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

/** One set of clips that play as a unit; `entered`/`left` track whether it is on screen. */
function createGroup(element) {
  const videos = Array.from(element.querySelectorAll("video"));
  if (!videos.length) return null;

  // The shared restart replaces the per-clip loop.
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
    if (onScreen) videos.forEach((video) => video.play().catch(() => {}));
  };

  const markFinished = () => {
    finished += 1;
    if (finished >= videos.length) restart();
  };

  videos.forEach((video) => {
    video.addEventListener("ended", markFinished);
    // A clip that cannot load must not hold the set open for ever.
    video.addEventListener("error", markFinished);
  });

  return {
    entered() {
      onScreen = true;
      // An already-finished clip restarts by itself when played, which would strand
      // its partners mid-cycle, so the whole set starts over instead.
      if (videos.some((video) => video.ended)) restart();
      else videos.forEach((video) => video.play().catch(() => {}));
    },
    left() {
      onScreen = false;
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

  // One unit per set. A clip outside any set is watched on its own.
  const units = new Map();
  cards.forEach((card) => {
    const element = (card.closest && card.closest(GROUPS)) || card;
    if (!units.has(element)) units.set(element, createGroup(element));
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const group = units.get(entry.target);
        if (!group) return;
        if (entry.isIntersecting) group.entered();
        else group.left();
      });
    },
    { rootMargin: "200px 0px" }
  );

  units.forEach((group, element) => {
    if (group) observer.observe(element);
  });
}
