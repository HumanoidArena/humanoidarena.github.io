/* Markup primitives shared by the page renderers. */

/**
 * Escape a value for use in markup. Content is authored text rather than user
 * input, but several fields carry characters that a parser would otherwise read
 * as markup ("P&PBox", "policy&tracker"), so every plain-text field goes through
 * here. Fields holding intentional markup are marked as such in `content.js`.
 */
export function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Join the truthy names in a class list: `cls("a", wide && "a--wide")`. */
export function cls(...names) {
  return names.filter(Boolean).join(" ");
}

/**
 * One clip card: a labelled header above the video. Every video on the page is
 * one of these, so the playback attributes live in exactly one place.
 *
 * `preload="none"` and the absence of `autoplay` are deliberate: between them they
 * stop the browser fetching any of the footage until `js/media.js` starts a clip
 * as it nears the viewport. Thirty-two clips would otherwise pull tens of
 * megabytes before the reader scrolls anywhere.
 *
 * `clip` is `{ label, src }`.
 */
export function mediaCard(clip) {
  return `<figure class="media-card">
          <div class="media-card-header"><span>${esc(clip.label)}</span></div>
          <video src="${esc(clip.src)}" muted loop playsinline controls preload="none"></video>
        </figure>`;
}

/** A two-up row of clip cards, as used by a task row and a result scenario. */
export function mediaPair(clips) {
  return `<div class="task-media-pair">${clips.map(mediaCard).join("")}</div>`;
}