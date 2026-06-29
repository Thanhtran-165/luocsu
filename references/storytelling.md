# Storytelling — shaping acts, hooks, and scenes

The data schema defines fields; this defines how to *fill* them well. A timeline deck lives or dies on narrative texture, not on completeness of dates.

## The 4-act spine

Acts are not date bins — they are dramatic phases. Pick labels that name the *movement* of a life:

| Weak (date bins) | Strong (dramatic phases) |
|---|---|
| 1955–1984 / 1985–1986 / 1997–2003 / 2007–2011 | **Vươn lên** / **Sụp đổ & Lưu đày** / **Phục hưng** / **Đỉnh cao** |

The act *title* carries the meaning; the `range` is just a date caption beneath it. When choosing acts, look for the inflection points where the person's trajectory reversed — those are the act boundaries.

Rules:
- **Exactly 4 acts.** Fewer loses rhythm; more overwhelms the act slides (which hold 2-5 milestone cards each).
- **Spread milestones roughly evenly.** Don't put 8 milestones in act 1 and 1 in act 4. If one life phase is thin, either merge it or accept a 2-card act (a short act can be a deliberate pause).
- The act title should make a reader curious *before* they see the cards.

## The hook — always a question

The `hook` field appears on the act-slide card and is the entire reason someone clicks. Write it as **one provocative question** that teases a paradox, twist, or stakes. Never a statement, never a summary.

| Weak (statement) | Strong (question) |
|---|---|
| Jobs bị cha mẹ nuôi nhận vì luật sư đổi ý. | Một bé trai bị luật sư từ chối vì 'họ muốn bé gái' — làm sao cuộc hoán đổi ấy đẻ ra Steve Jobs? |
| Woz muốn cho Apple I miễn phí. | Một kẻ bỏ 10% cổ phần Apple ngày 1/4/1976 với 800 đô — và mất 2,6 tỷ. Bạn có can đảm đi chuyến đó không? |

The hook should make the reader feel they'd miss something by *not* clicking. A paradox, an irony, a number that doesn't fit — those are hook material.

## The scene — specificity is everything

The `scene` field is the single biggest quality signal. It is ONE concrete moment: a place, a date, an action, ideally a line of dialogue. This is what separates a documentary from a Wikipedia page.

Good scene (Steve Jobs, 1984 launch):

> Ngày 24/1/1984, Flint Auditorium 2.600 chỗ. Jobs rút đĩa mềm 3,5 inch từ túi áo, nhạc Chariots of Fire vang lên. Nhấn chuột, Mac cất lời: 'Xin chào. Tôi là Macintosh. Thật tuyệt khi thoát khỏi cái túi đó...' Vỗ tay kéo dài 5 PHÚT.

Bad scene (vague, no specifics):

> Jobs ra mắt Macintosh tại một sự kiện lớn và nhận được sự hoan nghênh nồng nhiệt.

Mining agents should be pushed hard on scenes — "if your dossier has no scene with a place/date/specific line, re-read your range, there is one."

## Motifs — the through-lines

`motif` tags let the same theme echo across decades. When the deck shows the same motif at age 20 and at age 50, the life *resonates*. Keep motifs short (1-3 words) and reusable:

- `Bị bỏ rơi & được chọn` / `Nghệ thuật gặp công nghệ` / `Giản dị / Zen` / `Impute` / `Insanely great`

3-5 motifs that recur is more powerful than 20 unique ones. During mining, watch for the same impulse showing up in different decades and tag it the same way.

## People — the telling detail

Every `people` entry is `"Name — role + one telling detail"`. The detail is the point — it makes a name into a person:

| Just a role | Role + telling detail |
|---|---|
| Lee Clow — giám đốc sáng tạo Chiat/Day | Lee Clow — giám đốc sáng tạo Chiat/Day, Venice Beach, râu rậm tóc rối, gắn bó Jobs 30 năm |
| Andy Hertzfeld — kỹ sư | Andy Hertzfeld — kiến trúc sư phần mềm, biển số MACWIZ, sáng hôm xuất hàng nằm hôn mê trên ghế |

The telling detail is what a reader would remember and repeat.

## Quotes — context is the payload

A famous quote alone is wallpaper. The `who` field should carry the *moment*, not just the name:

| Thin attribution | Rich attribution |
|---|---|
| — Jobs | — Jobs, mùa xuân 1983, yêu cầu quảng cáo |
| — Wozniak | — Wozniak, khi nghe HĐQT không cho phát sóng Super Bowl |

And always pair the translation (`vi`) with the original (`en`) when the source language differs — the original phrasing often carries a weight the translation can't.

## World-context — the parallel timeline

The `world` field anchors the milestone in its era. One or two same-year world facts make the biography feel situated. They needn't be about the subject — the point is *the world that year*:

> 1984: 420.000 Apple II so với 1,3 triệu IBM+clone.

Keep them short and concrete. Avoid generic "the personal computer revolution was underway" — that's filler.

## What to cut

If after mining you have 18 milestones, you have too many. Cut to 10-14 by asking: does removing this leave a gap in the spine, or is it a parallel anecdote that belongs as an *insight* instead? Milestones are the load-bearing events; rich-but-parallel material moves to the insights section.
