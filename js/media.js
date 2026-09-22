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

/**
 * One set of clips that play as a unit; `entered`/`left` track whether it is on screen.
 * Takes the clips rather than an element, so the behaviour can be tested without a browser
 * that can decode video.
 */
export function createClipGroup(videos) {
  if (!videos.length) return null;

  // The shared restart replaces the per-clip loop.
  videos.forEach((video) => {
    video.loop = false;
  });

  let onScreen = false;

  // A clip that fails to load never reports `ended`, so it is dropped from the set the
  // restart waits on. Counting it as finished once is not enough: it would stall every
  // cycle after the first, leaving its partners frozen on their last frame.
  const failed = new Set();
  const liveClips = () => videos.filter((video) => !failed.has(video));

  const restart = () => {
    liveClips().forEach((video) => {
      video.currentTime = 0;
    });
    if (onScreen) liveClips().forEach((video) => video.play().catch(() => {}));
  };

  // State rather than a tally, so it can be re-checked whenever anything changes.
  const restartOnceEveryClipHasFinished = () => {
    const live = liveClips();
    if (live.length && live.every((video) => video.ended)) restart();
  };

  videos.forEach((video) => {
    video.addEventListener("ended", restartOnceEveryClipHasFinished);
    video.addEventListener("error", () => {
      failed.add(video);
      restartOnceEveryClipHasFinished();
    });
  });

  return {
    entered() {
      onScreen = true;
      // An already-finished clip restarts by itself when played, which would strand
      // its partners mid-cycle, so the whole set starts over instead.
      if (videos.some((video) => video.ended)) restart();
      else liveClips().forEach((video) => video.play().catch(() => {}));
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
    const element = card.closest(GROUPS) || card;
    if (!units.has(element)) units.set(element, createClipGroup(Array.from(element.querySelectorAll("video"))));
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
