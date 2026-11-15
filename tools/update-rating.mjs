// يحدّث تقييم جوجل وعدد المراجعات في content.json + index.html
// usage: node tools/update-rating.mjs [--dir site-pixel]
import fs from 'node:fs/promises';
import path from 'node:path';

const dirArg = process.argv.indexOf('--dir');
const ROOT = path.resolve(dirArg > -1 ? process.argv[dirArg + 1] : 'site-pixel');

const PLACE_TOKEN = '0x145847bcf9523fc3:0xf642989c4fad179a';
const QUERY = 'Hamed Gym عزبة نافع المعادي';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

async function fetchRating() {
  const url = `https://www.google.com/search?tbm=map&hl=ar&gl=eg&q=${encodeURIComponent(QUERY)}`;
  const res = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'ar,en;q=0.9' } });
  if (!res.ok) throw new Error(`google ${res.status}`);
  const body = await res.text();
  const idx = body.indexOf(PLACE_TOKEN);
  if (idx < 0) throw new Error('place token not found');

  const window = body.slice(Math.max(0, idx - 800), idx);
  const matches = [...window.matchAll(/(\d\.\d),(\d{1,5})\]/g)];
  if (!matches.length) throw new Error('rating pair not found');
  const [, rating, count] = matches[matches.length - 1];
  return { rating, count };
}

async function main() {
  const contentPath = path.join(ROOT, 'content.json');
  const htmlPath = path.join(ROOT, 'index.html');
  const content = JSON.parse(await fs.readFile(contentPath, 'utf8'));

  let fresh;
  try {
    fresh = await fetchRating();
  } catch (e) {
    console.log(`skip: ${e.message}`);
    process.exit(0);
  }

  const oldRating = String(content.rating_value || '');
  const oldCount = String(content.rating_count || '');

  if (fresh.rating === oldRating && fresh.count === oldCount) {
    console.log(`unchanged: ${fresh.rating} / ${fresh.count}`);
    return;
  }

  content.rating_value = fresh.rating;
  content.rating_count = fresh.count;
  await fs.writeFile(contentPath, JSON.stringify(content, null, 2) + '\n', 'utf8');

  // keep the static HTML (SEO / no-JS) in sync
  let html = await fs.readFile(htmlPath, 'utf8');
  if (oldRating) html = html.split(`>${oldRating}<`).join(`>${fresh.rating}<`);
  if (oldCount) html = html.split(`>${oldCount}<`).join(`>${fresh.count}<`);
  html = html.split(`تقييم ${oldRating} من ${oldCount} مراجعة`).join(`تقييم ${fresh.rating} من ${fresh.count} مراجعة`);
  await fs.writeFile(htmlPath, html, 'utf8');

  console.log(`updated: ${oldRating}/${oldCount} -> ${fresh.rating}/${fresh.count}`);
}

main().catch(e => { console.error(e); process.exit(1); });
