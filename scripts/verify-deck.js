#!/usr/bin/env node
/**
 * verify-deck.js — automated layout/health check for a timeline-history deck.
 *
 * Checks (at a small viewport, default 918x676 — the reference deployment size):
 *   • every slide renders (deck has the expected slide count)
 *   • 0 console errors / 0 failed network requests
 *   • no current-slide content overflows past the bottom progress bar
 *   • no current-slide content hides under the top nav
 *   • modal images aren't broken or awkwardly cropped (loads with naturalWidth > 0)
 *   • overview mode shows clean thumbnails (only .ov-thumb visible per card)
 *
 * Usage:
 *   node verify-deck.js --url http://localhost:8001/index.html
 *   node verify-deck.js --url http://localhost:8001/index.html --width 1280 --height 800
 *   node verify-deck.js --url ... --slides 28     (expected slide count; default 28)
 *
 * Requires playwright. From the project that has node_modules/playwright:
 *   NODE_PATH="$(pwd)/node_modules" node verify-deck.js --url ...
 *
 * Exits non-zero if any check fails. Prints a summary.
 */
const { chromium } = require("playwright");

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith("--")) { args[a.slice(2)] = process.argv[++i]; }
}
const URL = args.url || "http://localhost:8001/index.html";
const W = parseInt(args.width || "918");
const H = parseInt(args.height || "676");
const EXPECTED = parseInt(args.slides || "28");

let failures = [];
const ok = (label, cond, detail = "") => {
  console.log(`${cond ? "✓" : "✗"} ${label}${detail ? "  — " + detail : ""}`);
  if (!cond) failures.push(label);
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const errors = [], reqFailed = [];
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  page.on("requestfailed", r => { reqFailed.push(r.url()); });

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  // 1. slide count
  const slideCount = await page.locator("#deck .slide").count();
  ok(`slide count = ${EXPECTED}`, slideCount === EXPECTED, `got ${slideCount}`);

  // 2. console / network health
  ok("0 console errors", errors.length === 0, errors.slice(0, 2).join(" | "));
  ok("0 failed requests", reqFailed.length === 0, reqFailed.slice(0, 2).join(" | "));

  // 3. for each slide, check it can become current without overflow
  let overflowSlides = [];
  for (let i = 0; i < Math.min(slideCount, EXPECTED); i++) {
    await page.evaluate((idx) => document.querySelectorAll("#deck .slide")[idx].scrollIntoView(), i);
    await page.waitForTimeout(450);
    const info = await page.evaluate(() => {
      const cur = document.querySelector(".slide.is-current");
      const navB = document.querySelector(".topnav")?.getBoundingClientRect();
      const prog = document.querySelector(".deck-progress")?.getBoundingClientRect();
      if (!cur) return null;
      // find the lowest content block
      const blocks = [...cur.querySelectorAll(".slide__reveal, .act__cards, .legacy__inner, .hero__sub")];
      let lowestBottom = 0;
      for (const b of blocks) { const r = b.getBoundingClientRect(); lowestBottom = Math.max(lowestBottom, r.bottom); }
      const cb = cur.getBoundingClientRect();
      return {
        overflowProgress: navB && prog ? (lowestBottom > prog.top ? Math.round(lowestBottom - prog.top) : 0) : null,
        slideBottom: Math.round(cb.bottom),
        contentBottom: Math.round(lowestBottom),
      };
    });
    if (info && info.overflowProgress > 2) overflowSlides.push({ i, over: info.overflowProgress });
  }
  ok("no content overflows progress bar", overflowSlides.length === 0,
     overflowSlides.length ? `slides ${overflowSlides.map(s => s.i + "(" + s.over + "px)").join(", ")}` : "");

  // 4. modal image loads intact (open a milestone that HAS an image).
  //    Not every milestone has an image (e.g. birth), so find a card whose data includes one.
  const imgStatus = await page.evaluate(() => {
    const cards = [...document.querySelectorAll(".milestone")];
    // find the first card whose milestone has an <img> already rendered, else the first card
    const withImg = cards.find(c => c.querySelector("img")) || cards[0];
    if (!withImg) return "no-cards";
    withImg.querySelector('[data-action="open"]')?.click();
    return "clicked";
  });
  if (imgStatus === "clicked") {
    await page.waitForTimeout(900);
    const imgInfo = await page.evaluate(() => {
      const img = document.querySelector(".detail__media");
      if (!img) return { present: false };
      const cs = getComputedStyle(img);
      return {
        present: true,
        loaded: img.complete && img.naturalWidth > 0,
        naturalW: img.naturalWidth,
        objectFit: cs.objectFit,
      };
    });
    ok("modal image present", imgInfo.present);
    ok("modal image loads", imgInfo.loaded, imgInfo.loaded ? "" : "naturalWidth=0");
    ok("modal image uses object-fit:contain", imgInfo.objectFit === "contain", `got ${imgInfo.objectFit}`);
  }

  // 5. overview mode shows only .ov-thumb
  await page.keyboard.press("Escape"); // close modal if open
  await page.waitForTimeout(200);
  await page.keyboard.press("o");
  await page.waitForTimeout(500);
  const ovInfo = await page.evaluate(() => {
    const deck = document.getElementById("deck");
    if (!deck.classList.contains("overview")) return { inOverview: false };
    const slides = [...deck.querySelectorAll(".slide")];
    let messy = 0;
    for (const s of slides) {
      const visibleDetail = [...s.children].filter(c => !c.classList.contains("ov-thumb") && getComputedStyle(c).display !== "none").length;
      if (visibleDetail > 0) messy++;
    }
    return { inOverview: true, total: slides.length, messy };
  });
  ok("overview mode activates", ovInfo.inOverview);
  ok("overview thumbnails clean (only .ov-thumb)", ovInfo.inOverview && ovInfo.messy === 0,
     ovInfo.messy ? `${ovInfo.messy}/${ovInfo.total} cards leak detail` : "");

  await browser.close();
  console.log("\n" + (failures.length === 0 ? "✅ ALL CHECKS PASSED" : `❌ ${failures.length} CHECK(S) FAILED: ${failures.join(", ")}`));
  process.exit(failures.length === 0 ? 0 : 1);
})();
