---
name: timeline-history
description: Build a cinematic, horizontal-slide-deck biographical timeline ("lược sử một cuộc đời") of any person, from a long-form biography source (PDF, book, articles). Produces a single self-contained index.html — zero dependencies, no build step — with starfield background, 4 narrative acts, per-year milestone cards opening a detail modal, a deep-dive "Khám phá sâu" insight section, depth-of-field transitions, and staggered content reveals. Invoke via /timeline-history <subject> or trigger naturally when the user wants a visual timeline / biography show / "tiểu sử" / "lược sử một cuộc đời" / life-story presentation / interactive biography of a historical figure, leader, artist, scientist, or any individual — even if they never say the word "timeline".
---

# Timeline History

Build a single-file `index.html` that presents a person's life as a cinematic **horizontal slide deck** — like a museum exhibit crossed with a documentary. One self-contained file, zero dependencies, rich content mined from a long biography.

## Invocation

```
/timeline-history <subject>            # e.g. /timeline-history Albert Einstein
/timeline-history <subject> từ <pdf>   # e.g. /timeline-history Marie Curie từ ~/Downloads/bio.pdf
```

Or just describe it in natural language ("làm timeline tiểu sử của X", "build a biography deck of Y") and the skill triggers automatically via its description. When the source (PDF path / book / URLs) isn't given, ask for it before mining — the whole format is built around *dense, story-driven content* from a long source, not Wikipedia bullets.

## When to use

Trigger this skill when the user wants a visual/interactive biography of a person — phrases like:

- "làm timeline về cuộc đời X", "tiểu sử", "lược sử một cuộc đời"
- "show trình diễn timeline", "biography deck", "life story presentation"
- "make a timeline of [person]'s life" / "visual biography"

Works best when a long-form source exists (a biography PDF, a book, a set of long articles). If only thin summary facts are available, ask for a richer source — the whole point of this format is **dense, story-driven content**, not Wikipedia bullets.

## The format

A horizontal deck of full-screen slides navigated by **arrow keys / wheel / click**:

```
[Hero] [Act 1] [Act 2] [Act 3] [Act 4] [Insight×N...] [Legacy]
```

- **Hero** — portrait + tagline + years
- **4 Acts** — each groups its milestone cards under a life phase (e.g. *Rise / Fall / Redemption / Peak*). A minimal card per year on the act slide; clicking the year opens a **detail modal** with the full dossier (hook, story, scene, people, quotes, world-context).
- **Insights** ("Khám phá sâu") — each a standalone slide organized by 3 themes: **products**, **life events**, **quotes**.
- **Legacy** — products, headline stats, verdict quotes.

This "card within a card" pattern keeps act slides readable while preserving deep detail behind a click.

### Why single-file, zero-dep

A past 3D/holographic version was abandoned for lag at 8fps and scroll conflicts. The lessons:

- **No frameworks, no npm, no build step.** Pure CSS + vanilla JS in one `index.html`.
- **Modal, not in-card scroll.** Detail lives in a modal that locks body scroll — this is the only sane way to avoid the page-scroll-vs-card-scroll conflict.
- **Test at the user's real viewport**, not a default 1280×800. The reference deployment was 918×676; cards that fit at 1280 overlap at 918.

## Workflow

### 1. Gather the source & decide the arc

Confirm the subject and the source (PDF path, book, URLs). Decide the **4 acts** — the narrative spine. Acts are life phases, not just date ranges:

- Steve Jobs example: Rise (1955–84) / Fall & Exile (85–86) / Redemption (97–03) / Peak (07–11)

Ask the user for the act names if the arc isn't obvious. Read `references/storytelling.md` for how to shape acts and write hooks.

### 2. Mine content with parallel agents (the critical step)

A biography is 800 pages; a single pass produces thin summaries. **Dispatch parallel Explore agents**, each reading a chapter range of the source, each returning a dense dossier. This is what makes the deck rich instead of generic.

Read **`references/mining-workflow.md`** in full before this step — it has the agent prompt template, how to split the source into ranges, and the exact dossier schema each agent must return.

Each agent returns one or more milestone dossiers matching this shape (see `references/data-schema.md` for the full field reference):

```jsonc
{
  "year": 1984,
  "chapter": "Ch.15 · The Launch",
  "title": "Macintosh & quảng cáo '1984'",
  "hook": "Quảng cáo bị HĐQT tuyên bố 'tồi tệ nhất' — vậy mà thành quảng cáo vĩ đại mọi thời. Làm sao một cái búa tạ cứu Apple?",
  "story": "Tháng 10/1983, IBM chiếm 26% thị trường PC...",        // 3-5 dense sentences
  "motif": ["Impute", "Insanely great"],
  "world": ["1984: Apple II 420k vs IBM+clone 1.3M"],              // world-context the same year
  "scene": "24/1/1984, Flint Auditorium. Jobs rút đĩa mềm 3,5\"...",  // one vivid concrete scene
  "people": ["Lee Clow — creative director Chiat/Day...", "..."],
  "quotes": [
    { "vi": "Tôi muốn một tiếng sét.", "who": "Jobs, 1983", "en": "I want a thunderclap." }
  ]
}
```

Write content in the user's language (Vietnamese for the Steve Jobs reference deck). Always include both a translated quote and the original where possible.

### 3. Collect images (Wikimedia Commons, CC-licensed)

Use `https://commons.wikimedia.org/` and grab the **direct thumbnail URL** (the `upload.wikimedia.org/.../960px-*.jpg` form). Aim for ~5 era-defining images; the template maps them across slides by year. Keep a running list — don't burn the web-search budget finding 28 unique photos.

### 4. Assemble the data JSON

Write the subject's data to `examples/<subject>.json` (see `examples/steve-jobs.json`). It holds: `MILESTONES[]`, `INSIGHTS[]`, `LEGACY{}`, `IMG{}`, `ACTS[]`, plus `META` (name, tagline, years).

### 5. Build the deck from the template

Copy `assets/templates/deck-template.html` to the project's `index.html`. The template is a **generalized** version of the reference deck: it fetches its content from a sibling `data.json` (or an inline `<script>` of the data object) and renders the deck dynamically. It is NOT hardcoded to Steve Jobs.

If the template needs adapting (extra slide types, different language chrome), edit it — but keep the architecture: single file, modal detail, horizontal scroll-snap deck, depth-of-field + staggered reveal CSS.

Read `references/deck-patterns.md` for the key techniques (scroll-snap, `IntersectionObserver` reveals, 3D tilt, spotlight, starfield canvas, overview mode) and why each is done the way it is.

### 6. Test & deploy

Run the verification script before declaring done:

```bash
cd <project> && python3 -m http.server 8001 &
NODE_PATH="<project>/node_modules" node ~/.agents/skills/timeline-history/scripts/verify-deck.js --url http://localhost:8001/index.html
```

`scripts/verify-deck.js` checks (at a small viewport like 918×676): every slide renders, 0 console errors, no content overflows past the progress bar, modal images aren't broken/cropped, and overview mode shows clean thumbnails. See the script header for options.

Then open in the user's browser: `open http://localhost:8001/index.html`. Watch them click through; layout bugs only surface at their real viewport.

## Key constraints (learned the hard way)

- **One file.** No `src/`, no imports, no npm. Inline CSS + JS.
- **Modal for detail, not scroll-in-card.** The page-scroll vs card-scroll conflict is real and wastes hours.
- **Test at the user's real viewport.** Don't assume 1280×800.
- **`object-fit: contain` for modal images**, never `cover` with a forced aspect ratio — portrait photos get decapitated.
- **Overview mode hides detail.** When zooming all slides to thumbnails, show only a kicker + title per card, not the full story.
- **Staggered reveal on `.slide.is-current`**, triggered by the `is-current` class, not `IntersectionObserver` for slide-level animation (IO is fine for cards *within* an act slide).

## Reference files

| File | Read when |
|---|---|
| `references/mining-workflow.md` | Before step 2 — the parallel-agent mining prompt & dossier schema |
| `references/data-schema.md` | When assembling the JSON — every field of MILESTONES/INSIGHTS/LEGACY |
| `references/storytelling.md` | When shaping acts, writing hooks, picking scenes |
| `references/deck-patterns.md` | When adapting the template — the CSS/JS techniques & why |
| `assets/templates/deck-template.html` | Step 5 — the generalized single-file template |
| `examples/steve-jobs.json` | A complete, real example data file |
| `scripts/verify-deck.js` | Step 6 — automated layout/error check |
