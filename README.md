# ROP Podcast App — v4

Premium podcast player with **100% legal audio** via official RSS feeds.

## Legal Audio Architecture

### How it works (same as Apple Podcasts, Spotify, Pocket Casts)

1. **RSS Feeds** — Every real podcast publishes a public RSS feed with direct MP3 URLs.
   These are intentionally public for distribution to any podcast player.
2. **HTML5 Audio** — Episodes stream via the browser's native `<audio>` element.
3. **CORS Proxy** — `corsproxy.io` (free, no key) forwards RSS XML to the browser.
4. **YouTube IFrame** — Only used for shows without public RSS (e.g. Spotify-exclusive),
   via the official YouTube IFrame API (YouTube ToS compliant).

### Shows with public RSS (streaming works)
- ✅ Huberman Lab — `feeds.megaphone.fm/hubermanlab`
- ✅ StarTalk Radio — `feeds.simplecast.com/wFNRqXmZ`
- ✅ Hardcore History — `feeds.feedburner.com/dancarlin/history`
- ✅ Diary of a CEO — `feeds.simplecast.com/nCE7AXQL`
- ✅ Lex Fridman — `lexfridman.com/feed/podcast/`
- ✅ Tim Ferriss — `rss.art19.com/tim-ferriss-show`
- ✅ Acquired — `feeds.simplecast.com/64U3GDe4`
- ✅ Darknet Diaries — `feeds.megaphone.fm/darknetdiaries`
- ✅ Knowledge Project — `feeds.simplecast.com/FoU_E-zr`
- ✅ We Study Billionaires — `feeds.megaphone.fm/theinvestorspodcast`

### Shows without public RSS (YouTube fallback)
- ⚡ Joe Rogan Experience — Spotify-exclusive, YouTube IFrame used
- ⚡ Making Sense — Subscriber-only, YouTube clips used

## Local Development

```bash
npm install
npm run dev
# → localhost:5173
```

## Deploy to Vercel

```bash
git init && git add . && git commit -m "ROP v4"
# Push to GitHub, then import at vercel.com → Deploy
```

## Real Images Used
- `/public/images/joe-rogan.jpg` — User-uploaded
- `/public/images/huberman-lab.jpg` — User-uploaded
- `/public/images/startalk.jpg` — User-uploaded
- `/public/images/hardcore-history.jpg` — User-uploaded
- `/public/images/diary-ceo.jpg` — User-uploaded
