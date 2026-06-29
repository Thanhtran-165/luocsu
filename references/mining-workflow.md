# Mining Workflow — parallel agents for dense biography content

The single biggest quality lever: a biography is hundreds of pages. One model pass produces thin Wikipedia-style summaries. **Dispatch parallel Explore agents**, each reading a chapter range, each returning dense dossiers. This is what separates a rich deck from a generic one.

## Step 1 — Extract the source text

For a PDF, extract with layout preserved (keeps paragraph breaks readable):

```bash
pdftotext -layout "Source Book.pdf" /tmp/source.txt
wc -l /tmp/source.txt   # note the total line count
```

For books/articles already in text/markdown, just note the file path. For long HTML, `references/storytelling.md` has a fetch note.

## Step 2 — Split into chapter ranges

Divide the text into **5–6 roughly equal chapter ranges** by line offset. Aim for ranges the agents can actually read (keep each under ~6000 lines so the read fits in context). Compute the slice:

```bash
TOTAL=$(wc -l < /tmp/source.txt)
CHUNK=$(( (TOTAL + 5) / 6 ))   # 6 agents
for i in 0 1 2 3 4 5; do
  START=$(( i * CHUNK + 1 ))
  END=$(( (i + 1) * CHUNK ))
  echo "agent $i: lines $START-$END"
done
```

## Step 3 — Dispatch the agents (parallel, one message)

Launch **all agents in a single message** so they run concurrently. Each gets the self-contained prompt below, with its line range filled in. Use `subagent_type: "Explore"`.

### The agent prompt template

```
Read /tmp/source.txt from line {START} to line {END} (use the Read tool with offset={START} and limit={END-START+1}). This is a chapter range from a biography.

For EACH major life milestone / pivotal moment you find in your range, return a dense dossier as a JSON array. Do NOT summarize — extract specifics: names, dates, quotes, scenes, numbers.

Each dossier MUST have these exact fields:
- year: integer (the year the milestone centers on)
- chapter: short original-chapter reference, e.g. "Ch.15 · The Launch"
- title: vivid Vietnamese title (6-12 words), the "what happened"
- hook: one provocative question that teases the story (the "why care")
- story: 3-5 dense sentences with real detail — names, numbers, cause/effect
- motif: array of 1-3 recurring themes (e.g. ["Impute", "Insanely great"])
- world: array of 1-3 world-context facts from that same year
- scene: ONE concrete vivid scene — a specific place, date, action, what was said
- people: array of 2-6 people, each as "Name — role + one telling detail"
- quotes: array of 1-3 objects: {vi: translated quote, who: attribution, en: original if available}

Rules:
- Density over brevity. The deck's value is in specifics the reader didn't know.
- Always include the original-language quote alongside the translation when available.
- If a milestone has no quotes/scene/people, still return it — fill what you can.
- Cover your whole range. Don't stop after 2 milestones if there are 5.

Return ONLY the JSON array of dossiers, no commentary.
```

## Step 4 — Collect & deduplicate

The agents return overlapping milestones at range boundaries (e.g. one ends mid-launch, the next starts there). Merge duplicates by year+title, keeping the fuller version. You should end up with **10–14 milestones** spanning the whole life.

## Step 5 — Derive insights

Insights are not just re-worded milestones. From the mined dossiers, derive **deep-dive insights** in 3 categories:

- **product** — the story *around a product* (the bet, the crisis, the craft). One per defining product.
- **life** — a pivotal *life event* not tied to a product (firing, illness, return, a relationship).
- **quote** — a famous quote with the *full context* of when/why it was said.

Each insight: `{cat, year, title, story (2-4 sentences), quote: {vi, who, en}}`. Aim for ~6 per category (18-22 total).

## Why this works

A model reading the whole book in one pass compresses toward the familiar highlights. Six agents each deep-reading a focused range surface the secondary characters, the numbers, the scenes — exactly the texture that makes a deck feel researched rather than cribbed. The merging step is cheap; the mining step is irreplaceable.

## Pitfalls

- **Don't let an agent bail early.** The prompt explicitly says cover the whole range. If an agent returns 1-2 items, re-dispatch that range with "you stopped too early, there are more milestones in lines X-Y."
- **Watch the read size.** If `wc -l` shows 30000 lines and you split into 4 agents, each reads 7500 lines — fine. 1 agent reading 30000 lines will truncate the tail.
- **Line offsets shift if you re-extract.** Re-run the split only against the current `/tmp/source.txt`.
