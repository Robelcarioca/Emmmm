/**
 * useYouTubePlayer — Real audio playback via YouTube IFrame API
 *
 * Creates a HIDDEN YouTube player div (off-screen) and drives it via YT.Player API.
 * This gives us real audio with full controls: play/pause/seek/speed/volume.
 *
 * The YouTube IFrame API script is loaded in index.html.
 * window.onYouTubeIframeAPIReady is called when the API is ready.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Global promise that resolves when YT API is ready
let _ytReady = false;
const _ytCallbacks = [];
window.onYouTubeIframeAPIReady = () => {
  _ytReady = true;
  _ytCallbacks.forEach(fn => fn());
  _ytCallbacks.length = 0;
};
function whenYtReady() {
  return new Promise(resolve => {
    if (_ytReady) return resolve();
    _ytCallbacks.push(resolve);
  });
}

const INITIAL_STATE = {
  playing: false,
  loading: false,
  buffering: false,
  error: null,
  currentVideoId: null,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  volume: 80,
  muted: false,
  speed: 1,
};

export default function useYouTubePlayer() {
  const [state, setState] = useState(INITIAL_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;

  const playerRef   = useRef(null);
  const tickRef     = useRef(null);
  const seekingRef  = useRef(false);
  const mountedRef  = useRef(true);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; } }, []);

  const safeSet = useCallback((patch) => {
    if (mountedRef.current) setState(s => ({ ...s, ...patch }));
  }, []);

  /* ── Progress tick ─────────────────────────────────────────── */
  const startTick = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      if (seekingRef.current) return;
      const p = playerRef.current;
      if (!p || typeof p.getCurrentTime !== 'function') return;
      try {
        const ct  = p.getCurrentTime() ?? 0;
        const dur = p.getDuration()    ?? 0;
        const buf = (p.getVideoLoadedFraction?.() ?? 0) * dur;
        safeSet({ currentTime: ct, duration: dur, buffered: buf });
      } catch (_) {}
    }, 400);
  }, [safeSet]);

  const stopTick = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
  }, []);

  /* ── Create/Replace YT player ──────────────────────────────── */
  const loadVideo = useCallback(async (videoId) => {
    if (!videoId) return;

    // If same video is already loaded, no re-init needed
    if (stateRef.current.currentVideoId === videoId && playerRef.current) {
      return;
    }

    safeSet({ loading: true, error: null, currentVideoId: videoId, currentTime: 0 });

    await whenYtReady();
    if (!window.YT?.Player) {
      safeSet({ loading: false, error: 'YouTube API failed to load' });
      return;
    }

    // Destroy old player
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch (_) {}
      playerRef.current = null;
    }

    // Create a fresh div inside the engine mount
    const engine = document.getElementById('yt-engine');
    if (!engine) return;
    engine.innerHTML = '';
    const div = document.createElement('div');
    div.id = 'yt-player-el';
    engine.appendChild(div);

    playerRef.current = new window.YT.Player('yt-player-el', {
      videoId,
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady(e) {
          try {
            e.target.setVolume(stateRef.current.volume);
            if (stateRef.current.muted) e.target.mute();
            e.target.setPlaybackRate(stateRef.current.speed);
            e.target.playVideo();
          } catch (_) {}
        },
        onStateChange(e) {
          const YTS = window.YT.PlayerState;
          switch (e.data) {
            case YTS.PLAYING:
              safeSet({ playing: true, loading: false, buffering: false });
              startTick();
              break;
            case YTS.PAUSED:
              safeSet({ playing: false, loading: false, buffering: false });
              stopTick();
              break;
            case YTS.BUFFERING:
              safeSet({ buffering: true });
              break;
            case YTS.ENDED:
              safeSet({ playing: false, currentTime: 0 });
              stopTick();
              break;
            case YTS.UNSTARTED:
              safeSet({ loading: true });
              break;
          }
        },
        onError(e) {
          const msg = {
            2:   'Invalid video ID',
            5:   'HTML5 player error',
            100: 'Video not found or private',
            101: 'Embedding disabled by owner',
            150: 'Embedding disabled by owner',
          }[e.data] ?? `Player error (code ${e.data})`;
          safeSet({ loading: false, buffering: false, error: msg, playing: false });
          stopTick();
        },
      },
    });
  }, [safeSet, startTick, stopTick]);

  /* ── Controls ──────────────────────────────────────────────── */
  const play = useCallback(() => {
    try { playerRef.current?.playVideo(); } catch (_) {}
  }, []);

  const pause = useCallback(() => {
    try { playerRef.current?.pauseVideo(); } catch (_) {}
  }, []);

  const togglePlay = useCallback(() => {
    if (stateRef.current.playing) pause(); else play();
  }, [play, pause]);

  const seek = useCallback((sec) => {
    const clamped = Math.max(0, Math.min(stateRef.current.duration || Infinity, sec));
    seekingRef.current = true;
    safeSet({ currentTime: clamped });
    try { playerRef.current?.seekTo(clamped, true); } catch (_) {}
    setTimeout(() => { seekingRef.current = false; }, 350);
  }, [safeSet]);

  const seekRelative = useCallback((delta) => {
    seek(stateRef.current.currentTime + delta);
  }, [seek]);

  const setVolume = useCallback((vol) => {
    const v = Math.max(0, Math.min(100, vol));
    try { playerRef.current?.setVolume(v); } catch (_) {}
    safeSet({ volume: v, muted: v === 0 });
  }, [safeSet]);

  const setSpeed = useCallback((rate) => {
    try { playerRef.current?.setPlaybackRate(rate); } catch (_) {}
    safeSet({ speed: rate });
  }, [safeSet]);

  const stop = useCallback(() => {
    try { playerRef.current?.stopVideo(); } catch (_) {}
    stopTick();
    safeSet({ playing: false, currentTime: 0 });
  }, [safeSet, stopTick]);

  useEffect(() => () => { stopTick(); }, [stopTick]);

  /* ── Formatted helpers ─────────────────────────────────────── */
  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
      : `${m}:${String(sec).padStart(2,'0')}`;
  };

  return {
    ...state,
    loadVideo,
    play, pause, togglePlay,
    seek, seekRelative,
    setVolume, setSpeed, stop,
    currentTimeStr: fmt(state.currentTime),
    durationStr:    fmt(state.duration),
    progress: state.duration > 0 ? state.currentTime / state.duration : 0,
    bufferedProgress: state.duration > 0 ? state.buffered / state.duration : 0,
  };
}
