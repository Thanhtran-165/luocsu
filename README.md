# Timeline History

A ZCode skill for building a **cinematic, horizontal-slide-deck biographical timeline** of any person, from a long-form biography source (PDF / book / articles).

The output is a single self-contained `index.html` — **zero dependencies, no build step** — featuring a starfield background, 4 narrative acts, per-year milestone cards that open a detail modal, a deep-dive "Khám phá sâu" insight section, depth-of-field transitions, and staggered content reveals.

```
[Hero] [Act 1] [Act 2] [Act 3] [Act 4] [Insight×N...] [Legacy]
```

## What's in this repo

```
timeline-history/
├── SKILL.md                     # workflow + when-to-trigger (the skill entry point)
├── README.md
├── references/
│   ├── mining-workflow.md       # parallel-agent mining prompt & dossier schema
│   ├── data-schema.md           # every field of MILESTONES / INSIGHTS / LEGACY
│   ├── storytelling.md          # how to shape acts, hooks, scenes, motifs
│   └── deck-patterns.md         # the CSS/JS techniques and why
├── assets/templates/
│   └── deck-template.html       # generic single-file template (fetches data.json)
├── examples/
│   └── steve-jobs.json          # a complete, real example data file
└── scripts/
    └── verify-deck.js           # automated Playwright layout/error check
```

## How to use

1. Pick a subject + biography source.
2. Mine content with parallel agents (see `references/mining-workflow.md`).
3. Assemble `data.json` following `references/data-schema.md`.
4. Copy `assets/templates/deck-template.html` + your `data.json` into a folder, serve it (`python3 -m http.server`), and open.
5. Run `node scripts/verify-deck.js --url http://localhost:8000/index.html` to catch layout errors before shipping.

## Live demo

A timeline built from Walter Isaacson's *Steve Jobs* biography, deployed to Vercel:
**https://steve-jobs-ecru.vercel.app**

## Requirements

- No npm, no frameworks. The deck is one HTML file.
- `scripts/verify-deck.js` needs Playwright installed in the project where you run it (`NODE_PATH` to a `node_modules` with playwright).
