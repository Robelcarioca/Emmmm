/**
 * useAudioPlayer.js
 *
 * Legal podcast audio engine using the HTML5 <audio> element.
 *
 * Streams MP3 files directly from podcast RSS feed enclosure URLs.
 * This is the same method used by Apple Podcasts, Pocket Casts,
 * Overcast, and all major podcast apps. Fully legal and free.
 *
 * For YouTube-hosted shows (e.g. Joe Rogan on Spotify), a YouTube
 * IFrame embed is used as fallback — still fully within YouTube ToS.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const INITIAL = {
  playing: false,
  loading: false,
  buffering: false,
  error: null,
  currentUrl: null,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  volume: 80,
  muted: false,
  speed: 1,
  type: 'audio', // 'audio' | 'youtube'
};

export default function useAudioPlayer() {
  const [state, setState] = useState(INITIAL);
  const stateRef   = useRef(state);
  stateRef.current = state;

  const audioRef   = useRef(null);   // <audio> element
  const ytRef      = useRef(null);   // YT.Player instance (fallback)
  const tickRef    = useRef(null);
  const mountedRef = useRef(true);
  const seekingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      _destroyAudio();
      _destroyYT();
      _stopTick();
    };
  }, []);

  const safeSet = useCallback((patch) => {
    if (mountedRef.current) setState(s => ({ ...s, ...patch }));
  }, []);

  /* ── Tick (updates currentTime from audio element) ────────── */
  function _startTick() {
    _stopTick();
    tickRef.current = setInterval(() => {
      if (seekingRef.current) return;
      const a = audioRef.current;
      if (!a) return;
      const buf = a.buffered.length > 0
        ? a.buffered.end(a.buffered.length - 1) : 0;
      safeSet({
        currentTime: a.currentTime,
        duration: a.duration || 0,
        buffered: buf,
      });
    }, 300);
  }

  function _stopTick() {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
  }

  /* ── Audio element helpers ────────────────────────────────── */
  function _destroyAudio() {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.src = '';
      a.load();
      // remove listeners
      a.onplay = a.onpause = a.onended = a.onerror =
      a.onwaiting = a.oncanplay = a.ontimeupdate = null;
      audioRef.current = null;
    }
  }

  function _destroyYT() {
    try { ytRef.current?.destroy(); } catch (_) {}
    ytRef.current = null;
    const eng = document.getElementById('yt-engine');
    if (eng) eng.innerHTML = '';
  }

  /* ── Load audio (RSS MP3) ─────────────────────────────────── */
  const loadAudio = useCallback((audioUrl) => {
    _destroyYT();
    _destroyAudio();
    _stopTick();

    safeSet({ loading: true, error: null, currentUrl: audioUrl,
              currentTime: 0, duration: 0, buffered: 0, type: 'audio' });

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'metadata';
    audio.volume  = stateRef.current.volume / 100;
    audio.muted   = stateRef.current.muted;
    audio.playbackRate = stateRef.current.speed;
    audioRef.current = audio;

    audio.oncanplay = () => safeSet({ loading: false, buffering: false });
    audio.onwaiting = () => safeSet({ buffering: true });
    audio.onplay    = () => { safeSet({ playing: true, loading: false }); _startTick(); };
    audio.onpause   = () => { safeSet({ playing: false }); _stopTick(); };
    audio.onended   = () => { safeSet({ playing: false, currentTime: 0 }); _stopTick(); };
    audio.onerror   = (e) => {
      const codes = { 1: 'Load aborted', 2: 'Network error', 3: 'Decode error', 4: 'Source not supported' };
      safeSet({ loading: false, error: codes[audio.error?.code] || 'Audio error' });
      _stopTick();
    };

    audio.src = audioUrl;
    audio.load();
    audio.play().catch(err => {
      // Autoplay blocked — user must tap play
      if (err.name === 'NotAllowedError') {
        safeSet({ loading: false, playing: false });
      } else {
        safeSet({ loading: false, error: err.message });
      }
    });
  }, [safeSet]);

  /* ── Load YouTube (fallback for Spotify-exclusive shows) ───── */
  const loadYouTube = useCallback(async (videoId) => {
    _destroyAudio();
    _destroyYT();
    _stopTick();

    safeSet({ loading: true, error: null, currentUrl: videoId,
              currentTime: 0, duration: 0, type: 'youtube' });

    // Wait for YT API
    await new Promise(resolve => {
      if (window.YT?.Player) return resolve();
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(s);
      }
    });

    const eng = document.getElementById('yt-engine');
    if (!eng) return;
    eng.innerHTML = '';
    const div = document.createElement('div');
    div.id = 'yt-el';
    eng.appendChild(div);

    ytRef.current = new window.YT.Player('yt-el', {
      videoId,
      height: '1', width: '1',
      playerVars: { autoplay: 1, controls: 0, rel: 0, modestbranding: 1, playsinline: 1 },
      events: {
        onReady(e) {
          e.target.setVolume(stateRef.current.volume);
          if (stateRef.current.muted) e.target.mute();
          e.target.setPlaybackRate(stateRef.current.speed);
          e.target.playVideo();
        },
        onStateChange(e) {
          const S = window.YT.PlayerState;
          if (e.data === S.PLAYING) {
            safeSet({ playing: true, loading: false, buffering: false });
            tickRef.current = setInterval(() => {
              const p = ytRef.current;
              if (!p || seekingRef.current) return;
              try {
                safeSet({
                  currentTime: p.getCurrentTime?.() ?? 0,
                  duration:    p.getDuration?.() ?? 0,
                  buffered:   (p.getVideoLoadedFraction?.() ?? 0) * (p.getDuration?.() ?? 0),
                });
              } catch (_) {}
            }, 400);
          } else if (e.data === S.PAUSED) {
            safeSet({ playing: false, loading: false });
            _stopTick();
          } else if (e.data === S.BUFFERING) {
            safeSet({ buffering: true });
          } else if (e.data === S.ENDED) {
            safeSet({ playing: false, currentTime: 0 });
            _stopTick();
          }
        },
        onError(e) {
          const msg = { 2:'Invalid video ID', 5:'HTML5 error', 100:'Video not found',
                        101:'Embedding disabled', 150:'Embedding disabled' }[e.data] || `Error ${e.data}`;
          safeSet({ loading: false, error: msg, playing: false });
          _stopTick();
        },
      },
    });
  }, [safeSet]);

  /* ── Unified loadEpisode ───────────────────────────────────── */
  const loadEpisode = useCallback((episode) => {
    if (episode?.audioUrl) {
      loadAudio(episode.audioUrl);
    } else if (episode?.youtubeId) {
      loadYouTube(episode.youtubeId);
    } else {
      safeSet({ error: 'No playable source found for this episode.' });
    }
  }, [loadAudio, loadYouTube, safeSet]);

  /* ── Controls ─────────────────────────────────────────────── */
  const play = useCallback(() => {
    if (stateRef.current.type === 'youtube') {
      try { ytRef.current?.playVideo(); } catch (_) {}
    } else {
      audioRef.current?.play().catch(() => {});
    }
  }, []);

  const pause = useCallback(() => {
    if (stateRef.current.type === 'youtube') {
      try { ytRef.current?.pauseVideo(); } catch (_) {}
    } else {
      audioRef.current?.pause();
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (stateRef.current.playing) pause(); else play();
  }, [play, pause]);

  const seek = useCallback((sec) => {
    const dur = stateRef.current.duration;
    const clamped = Math.max(0, Math.min(dur || Infinity, sec));
    seekingRef.current = true;
    safeSet({ currentTime: clamped });
    if (stateRef.current.type === 'youtube') {
      try { ytRef.current?.seekTo(clamped, true); } catch (_) {}
    } else if (audioRef.current) {
      audioRef.current.currentTime = clamped;
    }
    setTimeout(() => { seekingRef.current = false; }, 300);
  }, [safeSet]);

  const seekRelative = useCallback((delta) => {
    seek(stateRef.current.currentTime + delta);
  }, [seek]);

  const setVolume = useCallback((vol) => {
    const v = Math.max(0, Math.min(100, vol));
    if (stateRef.current.type === 'youtube') {
      try { ytRef.current?.setVolume(v); } catch (_) {}
    } else if (audioRef.current) {
      audioRef.current.volume = v / 100;
    }
    safeSet({ volume: v, muted: v === 0 });
  }, [safeSet]);

  const setSpeed = useCallback((rate) => {
    if (stateRef.current.type === 'youtube') {
      try { ytRef.current?.setPlaybackRate(rate); } catch (_) {}
    } else if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    safeSet({ speed: rate });
  }, [safeSet]);

  const stop = useCallback(() => {
    pause();
    _stopTick();
    safeSet({ playing: false, currentTime: 0 });
  }, [pause, safeSet]);

  /* ── Formatted helpers ────────────────────────────────────── */
  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const h   = Math.floor(s / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
      : `${m}:${String(sec).padStart(2,'0')}`;
  };

  return {
    ...state,
    loadEpisode, loadAudio, loadYouTube,
    play, pause, togglePlay,
    seek, seekRelative,
    setVolume, setSpeed, stop,
    currentTimeStr:   fmt(state.currentTime),
    durationStr:      fmt(state.duration),
    progress:         state.duration > 0 ? state.currentTime / state.duration : 0,
    bufferedProgress: state.duration > 0 ? state.buffered / state.duration : 0,
  };
}
