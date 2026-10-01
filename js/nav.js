/**
 * Table of contents: the entry for the section in view, and the open sub-list beneath it.
 *
 * The contents are rendered by `content.js`, so this runs after it. Scrolling is left to the
 * browser — the links are plain anchors and `html` carries `scroll-behavior: smooth`, so
 * `prefers-reduced-motion` turns the animation off without any code here.
 */

/** The element a contents link points at, or null when the id is not on the page. */
function targetFor(link) {
  return document.querySelector(link.getAttribute("href"));
}

/**
 * Mark the contents entry whose section is in view and open its sub-list. The observer band
 * is the upper part of the viewport, so the entry changes as a heading passes the top.
 */
function watchSections() {
  const items = Array.from(document.querySelectorAll(".content-toc-item"));
  const subItems = Array.from(document.querySelectorAll(".content-toc-subitem"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;

        subItems.forEach((sub) => {
          sub.classList.toggle("active", sub.getAttribute("href") === id);
        });

        items.forEach((item) => {
          // An expanded parent stays lit while one of its sub-items is active.
          const hasActiveChild = item.parentElement.querySelector(".content-toc-subitem.active");
          item.classList.toggle("active", item.getAttribute("href") === id || Boolean(hasActiveChild));
        });
      });
    },
    { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
  );

  items.concat(subItems).forEach((link) => {
    const target = targetFor(link);
    if (target) observer.observe(target);
  });
}

export function startNavigation() {
  watchSections();
}
