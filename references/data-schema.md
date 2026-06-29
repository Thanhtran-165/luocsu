# Data Schema

The subject's content lives in a single JSON file (`examples/<subject>.json`) that the deck template consumes. Below is every field. Optional fields are marked; everything else is required for a complete deck.

## Top level

```jsonc
{
  "META": { ... },          // hero + chrome
  "IMG": { ... },           // reusable image URLs
  "ACTS": [ ... ],          // 4 narrative phases, group milestone indices
  "MILESTONES": [ ... ],    // 10-14 life milestones (the spine)
  "INSIGHTS": [ ... ],      // ~18-22 deep-dive slides
  "LEGACY": { ... }         // final slide: products, stats, verdict
}
```

## META — hero slide + page chrome

```jsonc
"META": {
  "name": "Steve Jobs",
  "tagline": "Kẻ theo đuổi sự hoàn hảo — người đặt máy tính, âm nhạc và điện thoại vào tay hàng tỷ người.",
  "years": "1955 — 2011",
  "portrait": "https://upload.wikimedia.org/.../Steve_Jobs_Headshot_2010-CROP.jpg",
  "lang": "vi"             // content language; affects chrome labels
}
```

## IMG — reusable image URLs

A small object of named, era-defining images (Wikimedia Commons thumbnail URLs). The template maps them across slides by year — you don't need a unique photo per slide.

```jsonc
"IMG": {
  "portrait": "https://...",
  "garage":  "https://...",
  "mac":     "https://...",
  "wwdc":    "https://...",
  "iphone":  "https://..."
}
```

Add an `IMG_BY_YEAR` rule in the data (a function-shaped object) so insight slides pick an era-appropriate image:

```jsonc
"IMG_BY_YEAR": [
  { "max": 1974, "img": "garage" },
  { "max": 1984, "img": "mac" },
  { "max": 1998, "img": "wwdc" },
  { "max": 2007, "img": "iphone" },
  { "max": 9999, "img": "portrait" }
]
```

And `ACT_IMG`: an array (one per act) naming which image represents that act's slide background.

## ACTS — 4 narrative phases

```jsonc
"ACTS": [
  { "title": "Hồi 1 — Vươn lên",        "range": "1955 — 1984", "idxs": [0,1,2,3,4] },
  { "title": "Hồi 2 — Sụp đổ & Lưu đày", "range": "1985 — 1986", "idxs": [5,6] },
  { "title": "Hồi 3 — Phục hưng",        "range": "1997 — 2003", "idxs": [7,8,9,10] },
  { "title": "Hồi 4 — Đỉnh cao",         "range": "2007 — 2011", "idxs": [11,12] }
]
```

`idxs` are indices into `MILESTONES`. Keep acts to 4 — fewer loses rhythm, more overwhelms. Aim for a roughly even spread of milestones across acts (don't dump 8 in act 1 and 1 in act 4).

## MILESTONES — the life spine (10-14 items)

```jsonc
{
  "year": 1984,
  "chapter": "Chương 15 · The Launch: A Dent in the Universe",
  "title": "Macintosh & quảng cáo '1984'",
  "hook": "Quảng cáo bị HĐQT tuyên bố là 'tồi tệ nhất họ từng thấy' — vậy mà nó trở thành quảng cáo vĩ đại mọi thời đại. Làm sao một cái búa tạ cứu được Apple?",
  "story": "Tháng 10/1983, IBM chiếm 26% thị trường PC chỉ trong 2 năm...",   // 3-5 dense sentences
  "motif": ["Impute", "Insanely great"],                                      // 1-3 themes
  "world": [                                                                  // optional, 1-3 same-year world facts
    "1983: 420.000 Apple II so với 1,3 triệu IBM+clone"
  ],
  "scene": "Ngày 24/1/1984, Flint Auditorium 2.600 chỗ. Jobs rút đĩa mềm...", // optional, one vivid scene
  "scene2": "Cuộc khủng hoảng sản phẩm một tuần trước ngày giao...",          // optional, a second scene
  "people": [                                                                 // 2-6, "Name — role + telling detail"
    "Lee Clow — giám đốc sáng tạo Chiat/Day, râu rậm tóc rối...",
    "Ridley Scott — đạo diễn (vừa rời Blade Runner)..."
  ],
  "quotes": [                                                                 // 1-3
    { "vi": "Tôi muốn một tiếng sét.", "who": "Jobs, mùa xuân 1983", "en": "I want a thunderclap." }
  ],
  "subevents": ["16/1 là hạn chót xuất hàng..."],                             // optional
  "product": "Macintosh — chip Motorola 68000, 3½-inch floppy...",            // optional, specs/numbers
  "img": "https://..."                                                        // optional, milestone's own image
}
```

**Field intent:**

- `hook` — the question that makes someone *want* to click. Always a question, always teasing a paradox/twist.
- `story` — the 3-5 sentences that appear on the **act slide card** (clamped). The *detail modal* shows it in full.
- `scene` — a single concrete scene (place, date, action, dialogue). This is what makes it feel like a documentary, not a summary. Prefer `scene`/`scene2` over longer `story`.
- `motif` — short labels; they recur across milestones and the deck can show them as tags. Powerful when the same motif appears decades apart.
- `people` — format strictly as `"Name — role + one telling detail"`. The detail is the point (e.g. "râu rậm tóc rối", "biển số MACWIZ").
- `quotes` — `vi` is the translated Vietnamese (the only version the deck **renders**); `en` is the original, kept in the data for reference but hidden in the UI. Translate into natural Vietnamese — never word-by-word. Domain terms must use the correct Vietnamese equivalent (see `mining-workflow.md` translation rules).

## INSIGHTS — deep-dive slides (~6 per category)

```jsonc
{
  "cat": "product",                          // "product" | "life" | "quote"
  "year": 1984,
  "title": "Vì sao quảng cáo '1984' suýt bị hủy",
  "story": "HĐQT coi đây là quảng cáo tồi tệ nhất. Chỉ nhờ Lee Clow 'không cố' bán suất 60 giây và Bill Campbell quyết 'ném bóng dài' — quảng cáo đã lên sóng.",
  "quote": { "vi": "Vậy, tôi sẽ trả một nửa nếu anh chịu trả.", "who": "Wozniak", "en": "Well, I'll pay half if you will." }
}
```

Three categories, rendered in order with a section divider. The reference deck uses ~22 insights total. Each insight = one full-screen slide (magazine split: text panel + image).

## LEGACY — final slide

```jsonc
"LEGACY": {
  "intro": "\"Và chính Apple, mà Jobs coi là sáng tạo vĩ đại nhất — trở thành công ty giá trị nhất trên trái đất.\"",
  "epitaph": { "vi": "Click! And you're gone.", "who": "Steve Jobs · 2011", "en": "Perhaps it's like an on-off switch..." },
  "products": [
    { "year": "1984", "name": "Macintosh", "desc": "Máy tính cho mọi người, với giao diện đồ họa và chuột." }
  ],
  "stats": [
    { "big": "#1", "label": "Công ty giá trị nhất", "desc": "Apple trở thành công ty giá trị nhất thế giới." }
  ],
  "verdict": [
    { "vi": "Sản phẩm, không phải lợi nhuận, mới là động lực.", "who": "Steve Jobs", "en": "..." }
  ]
}
```

## Why optional fields matter

The template renders `scene`/`scene2`/`product`/`people`/`quotes` as labeled sections in the detail modal *only when present*. A milestone with just `story` looks bare; one with scene + people + quotes reads like a researched chapter. Mining agents should err on filling fields — you can always drop a weak section later.
