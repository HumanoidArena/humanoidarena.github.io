/* Markup primitives shared by the page renderers. */

/**
 * Escape a value for use in markup. Content is authored text, but fields carry
 * characters a parser would read as markup ("P&PBox"), so plain-text fields go through
 * here. Fields holding intentional markup are marked in `content.js`.
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
 * One clip card. `preload="none"` and the missing `autoplay` are deliberate: no clip is
 * fetched until `js/media.js` starts it near the viewport. `clip` is `{ label, src }`.
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
