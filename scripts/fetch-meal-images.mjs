#!/usr/bin/env node
// One-off script: for each dish name on stdin (one per line), hit Wikipedia's
// search-based pageimages API and grab the first-hit thumbnail. Tries the name
// + "indian food" first, then bare name as fallback.
//
// Usage: node scripts/fetch-meal-images.mjs dishes.txt > meal-images-fragment.ts

import { readFileSync } from "node:fs";

const SEARCH = (q) =>
  `https://en.wikipedia.org/w/api.php?action=query&format=json` +
  `&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=1` +
  `&prop=pageimages&piprop=thumbnail&pithumbsize=400`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchOne(q) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(SEARCH(q), {
        headers: { "user-agent": "wtc-image-curator/1.0 (contact: kamalkishore.sharma@bachatt.app)" },
      });
      if (r.status === 429) {
        await sleep(2000 * (attempt + 1));
        continue;
      }
      if (!r.ok) {
        process.stderr.write(`(http ${r.status}) `);
        return null;
      }
      const j = await r.json();
      const pages = j?.query?.pages ?? {};
      for (const p of Object.values(pages)) {
        const src = p?.thumbnail?.source;
        if (src) return src;
      }
      return null;
    } catch (e) {
      process.stderr.write(`(err ${e.message}) `);
      await sleep(1000);
    }
  }
  return null;
}

async function resolve(name) {
  const a = await searchOne(`${name} indian food`);
  if (a) return a;
  await sleep(150);
  return await searchOne(name);
}

const names = readFileSync(process.argv[2] ?? 0, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);

const out = {};
const misses = [];
let i = 0;
for (const name of names) {
  i++;
  process.stderr.write(`[${i}/${names.length}] ${name} ... `);
  const url = await resolve(name);
  if (url) {
    out[name] = url;
    process.stderr.write("ok\n");
  } else {
    misses.push(name);
    process.stderr.write("MISS\n");
  }
  await new Promise((r) => setTimeout(r, 250));
}

const sorted = Object.keys(out).sort();
console.log("export const MEAL_IMAGES: Record<string, string> = {");
for (const k of sorted) console.log(`  ${JSON.stringify(k)}: ${JSON.stringify(out[k])},`);
console.log("};");
console.log("");
console.log(`// misses (${misses.length}): ${misses.join(", ")}`);
