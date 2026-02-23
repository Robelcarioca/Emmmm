/**
 * rssParser.js
 *
 * Fetches and parses podcast RSS feeds — the 100% legal standard
 * used by Apple Podcasts, Spotify, Google Podcasts, etc.
 *
 * Podcast RSS feeds contain direct MP3 URLs that are intentionally
 * public for distribution to any podcast player.
 *
 * Uses allorigins.win as a CORS proxy since RSS servers typically
 * don't include browser CORS headers (they expect server-to-server).
 */

const CORS_PROXY = 'https://api.allorigins.win/get?url=';

/**
 * Fetch an RSS feed and return parsed episode objects
 * @param {string} feedUrl - The RSS feed URL
 * @param {number} limit - Max episodes to return
 * @returns {Promise<Array>} episodes
 */
export async function fetchRSSFeed(feedUrl, limit = 10) {
  const url = `${CORS_PROXY}${encodeURIComponent(feedUrl)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const json = await res.json();
  const xmlStr = json.contents;
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, 'application/xml');
  const items = Array.from(doc.querySelectorAll('item')).slice(0, limit);

  return items.map((item, i) => {
    const title    = item.querySelector('title')?.textContent?.trim() || `Episode ${i + 1}`;
    const enclosure = item.querySelector('enclosure');
    const audioUrl  = enclosure?.getAttribute('url') || null;
    const duration  = item.querySelector('duration')?.textContent?.trim() || '';
    const pubDate   = item.querySelector('pubDate')?.textContent?.trim() || '';
    const desc      = item.querySelector('description')?.textContent
                        ?.replace(/<[^>]+>/g, '')?.slice(0, 200)?.trim() || '';
    const image     = item.querySelector('image url')?.textContent
                      || item.querySelector('itunes\\:image, image')?.getAttribute('href')
                      || null;

    return {
      id:       `rss-${i}`,
      title,
      audioUrl,
      duration: parseDuration(duration),
      durationStr: duration,
      pubDate:  pubDate ? new Date(pubDate).toLocaleDateString() : '',
      desc,
      image,
    };
  });
}

/** Convert HH:MM:SS or seconds string to seconds number */
function parseDuration(str) {
  if (!str) return 0;
  const parts = str.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Number(str) || 0;
}
