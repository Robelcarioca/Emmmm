/**
 * usePodcastPlayer — Legal audio via real public RSS feeds
 *
 * How it works:
 * ─────────────
 * 1. Every real podcast publishes a public RSS/Atom feed. This is the standard
 *    protocol that ALL podcast apps (Apple Podcasts, Spotify, etc.) use.
 * 2. Each RSS feed episode contains a direct <enclosure> MP3/audio URL.
 *    These URLs are intentionally public — that's how podcasting works legally.
 * 3. We fetch the RSS via a CORS proxy (since browsers block cross-origin XML).
 * 4. We parse the XML and extract the real audio URLs.
 * 5. We play them with the browser's native HTMLAudioElement.
 *
 * CORS proxy used: https://corsproxy.io — free, no key needed.
 * Fallback proxy:  https://api.allorigins.win/raw?url=
 *
 * Result: 100% legal podcast audio. No copyright risk.
 * Podcast RSS feeds are public by design. Podcast publishers WANT them played.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const CORS_PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

// ── Parse RSS XML into episode list ─────────────────────────────────────────
function parseRSS(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const items = [...doc.querySelectorAll('item')];

  return items.slice(0, 10).map((item, idx) => {
    const enclosure = item.querySelector('enclosure');
    const audioUrl  = enclosure?.getAttribute('url') || '';
    const title     = item.querySelector('title')?.textContent?.trim() || `Episode ${idx + 1}`;
    const pubDate   = item.querySelector('pubDate')?.textContent?.trim() || '';
    const duration  = item.querySelector('duration')?.textContent?.trim() || '';

    // Format duration from seconds to mm:ss or hh:mm:ss
    const fmtDur = (d) => {
      if (!d) return '';
      if (d.includes(':')) return d; // already formatted
      const secs = parseInt(d);
      if (isNaN(secs)) return d;
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = Math.floor(secs % 60);
      return h > 0
        ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
        : `${m}:${String(s).padStart(2,'0')}`;
    };

    // Format date
    const fmtDate = (d) => {
      if (!d) return '';
      try { return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }); }
      catch { return d; }
    };

    return {
      id: idx + 1,
      title,
      audioUrl,
      duration: fmtDur(duration),
      date: fmtDate(pubDate),
      type: enclosure?.getAttribute('type') || 'audio/mpeg',
    };
  }).filter(ep => ep.audioUrl);
}

// ── Fetch RSS with proxy fallback ───────────────────────────────────────────
async function fetchRSS(rssUrl) {
  for (const makeProxy of CORS_PROXIES) {
    try {
      const res = await fetch(makeProxy(rssUrl), { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const text = await res.text();
      const episodes = parseRSS(text);
      if (episodes.length > 0) return episodes;
    } catch (_) {
      // Try next proxy
    }
  }
  return [];
}

// ── RSS Episode Cache ────────────────────────────────────────────────────────
const episodeCache = new Map();

export async function loadEpisodes(podcast) {
  const feedUrl = podcast?.rssFeed || podcast?.rssUrl;
  if (!feedUrl) return [];
  if (episodeCache.has(podcast.id)) return episodeCache.get(podcast.id);

  const eps = await fetchRSS(feedUrl);
  if (eps.length) episodeCache.set(podcast.id, eps);
  return eps;
}

// ── Main Player Hook ─────────────────────────────────────────────────────────
const INIT = {
  playing:     false,
  loading:     false,
  error:       null,
  currentTime: 0,
  duration:    0,
  buffered:    0,
  volume:      0.8,
  speed:       1,
  audioUrl:    null,
  podcastId:   null,
};

export default function usePodcastPlayer() {
  const [state, setState] = useState(INIT);
  const stateRef  = useRef(state);
  stateRef.current = state;

  const audioRef    = useRef(null);  // HTMLAudioElement
  const mountedRef  = useRef(true);
  const seekingRef  = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const safeSet = useCallback((patch) => {
    if (mountedRef.current) setState(s => ({ ...s, ...patch }));
  }, []);

  // ── Get or create audio element ──────────────────────────────────────────
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.crossOrigin = 'anonymous';
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  // ── Wire up events ───────────────────────────────────────────────────────
  const wireEvents = useCallback((audio) => {
    audio.onplay     = ()  => safeSet({ playing: true,  loading: false });
    audio.onpause    = ()  => safeSet({ playing: false });
    audio.onwaiting  = ()  => safeSet({ loading: true  });
    audio.oncanplay  = ()  => safeSet({ loading: false });
    audio.ondurationchange = () => safeSet({ duration: audio.duration || 0 });
    audio.ontimeupdate = () => {
      if (seekingRef.current) return;
      const buffered = audio.buffered.length > 0
        ? audio.buffered.end(audio.buffered.length - 1) : 0;
      safeSet({ currentTime: audio.currentTime, buffered });
    };
    audio.onended    = ()  => safeSet({ playing: false, currentTime: 0 });
    audio.onerror    = (e) => {
      const msgs = { 1:'Aborted', 2:'Network error', 3:'Decode error', 4:'Not supported' };
      const code = audio.error?.code;
      safeSet({
        playing: false, loading: false,
        error: msgs[code] || 'Playback error — try opening on Spotify.',
      });
    };
    audio.onvolumechange = () => safeSet({ volume: audio.volume });
    audio.onratechange   = () => safeSet({ speed: audio.playbackRate });
  }, [safeSet]);

  // ── Load a specific audio URL ────────────────────────────────────────────
  const loadAudio = useCallback(async (audioUrl, podcastId) => {
    if (!audioUrl) return;

    const audio = getAudio();

    // Already loaded → skip
    if (stateRef.current.audioUrl === audioUrl) return;

    // Stop current
    audio.pause();
    audio.src = '';

    safeSet({ loading: true, error: null, audioUrl, podcastId, currentTime: 0, duration: 0 });

    wireEvents(audio);
    audio.volume = stateRef.current.volume;
    audio.playbackRate = stateRef.current.speed;
    audio.src = audioUrl;
    audio.load();

    try {
      await audio.play();
    } catch (err) {
      // Autoplay blocked — user must tap play
      safeSet({ loading: false, playing: false });
    }
  }, [getAudio, wireEvents, safeSet]);

  // ── Controls ─────────────────────────────────────────────────────────────
  const play = useCallback(async () => {
    const audio = getAudio();
    if (!audio.src) return;
    try { await audio.play(); } catch (_) {}
  }, [getAudio]);

  const pause = useCallback(() => {
    getAudio().pause();
  }, [getAudio]);

  const togglePlay = useCallback(() => {
    if (stateRef.current.playing) pause(); else play();
  }, [play, pause]);

  const seek = useCallback((sec) => {
    const audio = getAudio();
    const clamped = Math.max(0, Math.min(audio.duration || 0, sec));
    seekingRef.current = true;
    audio.currentTime = clamped;
    safeSet({ currentTime: clamped });
    setTimeout(() => { seekingRef.current = false; }, 200);
  }, [getAudio, safeSet]);

  const seekRelative = useCallback((delta) => {
    seek(stateRef.current.currentTime + delta);
  }, [seek]);

  const setVolume = useCallback((vol) => {
    const v = Math.max(0, Math.min(1, vol));
    getAudio().volume = v;
    safeSet({ volume: v });
  }, [getAudio, safeSet]);

  const setSpeed = useCallback((rate) => {
    getAudio().playbackRate = rate;
    safeSet({ speed: rate });
  }, [getAudio, safeSet]);

  const stop = useCallback(() => {
    const audio = getAudio();
    audio.pause();
    audio.currentTime = 0;
    safeSet({ playing: false, currentTime: 0 });
  }, [getAudio, safeSet]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) { audio.pause(); audio.src = ''; }
    };
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
      : `${m}:${String(sec).padStart(2,'0')}`;
  };

  const { currentTime, duration } = state;

  return {
    ...state,
    loadAudio,
    play, pause, togglePlay,
    seek, seekRelative,
    setVolume, setSpeed, stop,
    currentTimeStr:    fmt(currentTime),
    durationStr:       fmt(duration),
    progress:          duration > 0 ? currentTime / duration : 0,
    bufferedProgress:  duration > 0 ? state.buffered / duration : 0,
  };
}
