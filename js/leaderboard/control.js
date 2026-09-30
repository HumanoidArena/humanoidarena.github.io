/**
 * A segmented control: one track, one button per option, and a thumb under the selected one.
 *
 * Selection lives in the ARIA state alone — `aria-selected` on a tablist, `aria-checked` on a
 * radiogroup — so the styles, the thumb and the keyboard handling all read the same source.
 * Nothing here knows what the control means.
 */

import { esc, prefersReducedMotion } from "../dom.js";

/** The track's contents: the thumb, then one button per option. `optionAttributes` supplies
 * each button's own ARIA, and the first option starts selected. */
function segmentMarkup(items, optionAttributes) {
  const thumb = `<span class="lb-seg-thumb" aria-hidden="true"></span>`;
  return (
    thumb +
    items
      .map((item, index) => {
        const selected = index === 0;
        return `<button class="lb-seg-item" type="button" ${optionAttributes(item, selected)}` +
          `${selected ? "" : ' tabindex="-1"'}>${esc(item.label)}</button>`;
      })
      .join("")
  );
}

/**
 * Position a control's thumb under its selected item. Called without animation on first paint,
 * on resize and once the web font has settled the item widths; with animation when the
 * selection moves, so a change reads as one object moving rather than two backgrounds swapping.
 */
function positionThumb(control, animate) {
  const thumb = control.querySelector(".lb-seg-thumb");
  const selected = control.querySelector('[aria-selected="true"], [aria-checked="true"]');
  if (!thumb || !selected) return;

  const apply = () => {
    thumb.style.width = `${selected.offsetWidth}px`;
    thumb.style.transform = `translateX(${selected.offsetLeft}px)`;
  };

  if (animate) {
    apply();
    return;
  }
  thumb.style.transition = "none";
  apply();
  void thumb.offsetWidth; // flush the jump before re-enabling movement
  thumb.style.transition = "";
}

/** Build a control and make it behave: one item selected and in the tab order, the arrow keys
 * stepping through the rest, and `onSelect` told which index was chosen. */
export function mountControl(control, items, optionAttributes, onSelect) {
  control.innerHTML = segmentMarkup(items, optionAttributes);

  const buttons = Array.from(control.querySelectorAll(".lb-seg-item"));
  const stateAttribute = control.getAttribute("role") === "tablist" ? "aria-selected" : "aria-checked";

  const select = (index, focus) => {
    buttons.forEach((button, i) => {
      button.setAttribute(stateAttribute, i === index ? "true" : "false");
      button.tabIndex = i === index ? 0 : -1;
    });

    onSelect(index);
    positionThumb(control, !prefersReducedMotion());
    if (focus && buttons[index]) buttons[index].focus();
  };

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => select(index, false));

    button.addEventListener("keydown", (event) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      let next = null;
      if (step) next = (index + step + buttons.length) % buttons.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = buttons.length - 1;

      if (next !== null) {
        event.preventDefault();
        select(next, true);
      }
    });
  });
}

/** Keep the thumbs aligned as the layout changes: on first paint, on resize, and once the web
 * font has settled the item widths. */
export function trackThumbPositions(controls) {
  const reposition = () => controls.forEach((control) => positionThumb(control, false));

  reposition();
  window.addEventListener("resize", reposition);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(reposition);
  }
}
