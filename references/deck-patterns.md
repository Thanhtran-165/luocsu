# Deck Patterns — the CSS/JS techniques and why

The template (`assets/templates/deck-template.html`) implements these. This doc explains *how* each works and *why* it's done this way, so you can adapt without breaking the architecture.

## 1. Horizontal scroll-snap deck

```css
.deck {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.slide {
  flex: 0 0 100vw;
  height: 100vh;
  scroll-snap-align: center;
}
```

Each slide is one full viewport; `scroll-snap-type: x mandatory` makes the deck snap to whole slides on any scroll/drag. Navigation: arrow keys, wheel (debounced), on-screen arrows, ruler ticks, and overview thumbnails all just call `goToSlide(idx)` which does `deck.scrollTo({left: target.offsetLeft, behavior: "smooth"})`.

**Why horizontal, not vertical:** the user explicitly wanted slide-deck navigation (arrow keys), not infinite-scroll-down. Horizontal also makes the "4 acts in sequence" feel like chapters, not a feed.

## 2. The `is-current` class — the one source of truth

`updateUI()` toggles `is-current` on exactly one slide (the one nearest the scroll position). Almost every visual effect keys off `.slide.is-current`, not off scroll events:

```css
.slide { opacity: 0.32; transform: scale(0.96); filter: blur(2px) saturate(0.7); }
.slide.is-current { opacity: 1; transform: scale(1); filter: blur(0) saturate(1); }
```

This is the **depth-of-field** transition: the current slide is sharp, neighbors blur & dim. It costs nothing per-frame (pure CSS transition), unlike a render loop.

`updateUI` is called both after `goToSlide` (programmatic nav) and on a scroll listener (manual drag/touch) so the two stay in sync.

## 3. Staggered content reveal

Each reveal-able block inside a slide gets class `slide__reveal` and an index via `style="--reveal-i:N"`:

```css
.slide__reveal {
  opacity: 0; transform: translateY(26px);
  transition: opacity 0.6s var(--ease), transform 0.6s var(--ease);
  transition-delay: calc(var(--reveal-i, 0) * 0.08s + 0.12s);
}
.slide.is-current .slide__reveal { opacity: 1; transform: translateY(0); }
```

When the slide becomes current, its blocks rise in 0.08s steps: kicker → title → story → quote. The image slides in separately (`.slide__reveal-img`, translateX, 0.3s delay).

**Why key off `is-current`, not `IntersectionObserver`:** for slide-level animation, the class is the single trigger. IO is still used for cards *within* an act slide (milestone cards reveal as the act slide enters), because those are sub-units the class doesn't track.

## 4. Modal detail (not scroll-in-card)

The act slide shows minimal milestone cards. Clicking a year opens a centered modal:

```css
#detail-modal { position: fixed; inset: 0; ... transform: translate(-50%,-50%) scale(0.94); opacity: 0; }
#detail-modal.open { transform: translate(-50%,-50%) scale(1); opacity: 1; }
```

Opening the modal sets `document.body.style.overflow = "hidden"` — this **locks page scroll** and is the cure for the page-scroll-vs-card-scroll conflict that plagued earlier in-card-scroll designs.

**Why this matters:** a long detail card inside a slide invites the scroll wheel to either scroll the card or the deck, and it's ambiguous. The modal removes the ambiguity by pausing the deck entirely.

## 5. Images: `object-fit: contain` in modal, `cover` in panels

Modal images (`object-fit: contain`, `max-height: 46vh`) — never crop a portrait photo. Earlier `aspect-ratio: 16/10` + `cover` decapitated the 1984 Jobs portrait. Insight panel images use `cover` (they're decorative, sized to the panel).

The insight slide uses a **magazine split**: text panel left, real image right (not a faint watermark behind text). This solved two problems at once — it stopped the title/content from stacking over the image, and made the photo a visible design element.

## 6. Overview mode — clean thumbnails

`toggleOverview()` adds class `overview` to `.deck`, shrinking slides to 240×150 thumbnails. The critical rule:

```css
.deck.overview .slide > *:not(.ov-thumb) { display: none !important; }
.deck.overview .ov-thumb { display: flex; ... }
```

Each slide has a pre-built `.ov-thumb` (kicker + title). In overview, **all real content is hidden and only the thumb shows**. Without this, a 150px card tries to render 200 words of story → illegible mess. Thumbs also `flex-wrap` into rows instead of one long line.

## 7. 3D tilt + spotlight (pointer-follow, no render loop)

```js
deck.addEventListener("pointermove", (e) => {
  const card = e.target.closest(".milestone");
  // compute px,py from cursor position; set card.style.transform = perspective(...) rotateX/Y
  const media = e.target.closest(".insight-slide__media");
  media.style.setProperty("--mx", mx + "%");  // CSS radial-gradient uses --mx/--my
});
```

Two handlers, both pure style writes on pointermove — no `requestAnimationFrame` loop, no per-frame cost when idle. The spotlight is a CSS `radial-gradient` positioned at `--mx/--my`:

```css
.insight-slide__media::before {
  background: radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(232,177,77,0.22), transparent 55%);
}
```

## 8. Starfield background (canvas, throttled)

A single `<canvas>` draws ~160 twinkling stars drifting leftward. Key: it **pauses when the modal is open** and caps star count by viewport area. An earlier 3D version hit 8fps because its render loop never paused and ran bloom at 2x Retina; this canvas holds 120fps and stops entirely when not needed.

```js
if (reduceMotion) return;               // honor prefers-reduced-motion
const count = Math.min(160, Math.floor(w * h / 9000));
```

## 9. Ruler + progress — cheap spatial nav

The vertical ruler (left edge) is one tick per slide-with-a-year; clicking jumps. The bottom progress bar fills with current-slide/total. Both update from the single `updateUI()` call, so they never disagree with each other or the deck.

## Adapting the template

When the subject needs something the template doesn't have (a map slide, a comparison slide, a different number of acts):

1. Add the slide type as a new `slide--<type>` class and a branch in `buildDeck()`.
2. Give it the standard `slide__reveal` blocks so it inherits the staggered reveal.
3. If it has a year, add a ruler tick; if not, it's fine (non-year slides just don't get one).
4. Re-run `scripts/verify-deck.js` — it catches overflow and console errors that adapting usually introduces.
