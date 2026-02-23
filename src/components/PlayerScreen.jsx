import { useState, useRef, useEffect } from 'react';
import { SoundWave } from './SoundWave.jsx';
import {
  ChevDown, PlayFill, PauseFill,
  Rew15, Fwd30, PlusIcon,
  SpotifyLogo, YTLogo,
  HeartIcon, DlIcon, MoonIcon, VolIcon,
} from './Icons.jsx';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

// ── YouTube Embedded Player ───────────────────────────────────────────────
// Shows an actual embedded YouTube player for podcasts without public RSS.
// This uses the official YouTube IFrame API — fully within YouTube ToS.
function YouTubeEmbed({ videoId, accent }) {
  const containerRef = useRef(null);
  const playerRef    = useRef(null);
  const [ytReady,  setYtReady]  = useState(false);
  const [ytPlaying, setYtPlaying] = useState(false);
  const [ytLoading, setYtLoading] = useState(true);
  const [ytTime,   setYtTime]   = useState(0);
  const [ytDur,    setYtDur]    = useState(0);
  const tickRef = useRef(null);

  useEffect(() => {
    if (!videoId) return;

    const mountId = `yt-embed-${videoId}`;

    const initPlayer = () => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = '';
      const div = document.createElement('div');
      div.id = mountId;
      containerRef.current.appendChild(div);

      playerRef.current = new window.YT.Player(mountId, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          controls: 1,         // Show YouTube's own controls
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onReady() {
            setYtReady(true);
            setYtLoading(false);
          },
          onStateChange(e) {
            const S = window.YT.PlayerState;
            if (e.data === S.PLAYING) {
              setYtPlaying(true);
              tickRef.current = setInterval(() => {
                try {
                  setYtTime(playerRef.current?.getCurrentTime?.() ?? 0);
                  setYtDur(playerRef.current?.getDuration?.() ?? 0);
                } catch (_) {}
              }, 500);
            } else {
              setYtPlaying(false);
              clearInterval(tickRef.current);
            }
          },
          onError() {
            setYtLoading(false);
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      // Load YouTube IFrame API if not already loaded
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(s);
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        initPlayer();
      };
    }

    return () => {
      clearInterval(tickRef.current);
      try { playerRef.current?.destroy(); } catch (_) {}
      playerRef.current = null;
    };
  }, [videoId]);

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
      : `${m}:${String(sec).padStart(2,'0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* YouTube badge */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '6px 14px', background: 'rgba(255,0,0,.12)',
        border: '1px solid rgba(255,0,0,.25)', borderRadius: 10,
        fontSize: 11, color: '#FF5555', fontFamily: "'DM Sans',sans-serif", fontWeight: 700,
      }}>
        <YTLogo s={13}/> Playing via YouTube — 100% official & legal
      </div>

      {/* Video window */}
      <div style={{
        width: '100%', aspectRatio: '16/9', borderRadius: 18, overflow: 'hidden',
        background: '#000',
        boxShadow: `0 20px 60px rgba(0,0,0,.8), 0 0 40px ${accent}20`,
        border: '1px solid rgba(255,255,255,.08)',
        position: 'relative',
      }}>
        {ytLoading && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: '#000',
          }}>
            <div className="spinner" style={{ borderTopColor: '#FF0000' }}/>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontFamily: "'DM Sans',sans-serif" }}>
              Loading YouTube player…
            </span>
          </div>
        )}
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}/>
      </div>

      {/* Time display */}
      {ytDur > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontFamily: "'DM Sans',sans-serif" }}>
            {fmt(ytTime)}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontFamily: "'DM Sans',sans-serif" }}>
            {fmt(ytDur)}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Main Player Screen ────────────────────────────────────────────────────
export default function PlayerScreen({
  podcast, episode,
  playerMode,      // 'idle' | 'loading' | 'rss' | 'youtube' | 'error'
  rssPlayer,
  youtubeVideoId,
  onClose, onOpenAddModal,
}) {
  const [liked,     setLiked]     = useState(false);
  const [showVol,   setShowVol]   = useState(false);
  const [showSleep, setShowSleep] = useState(false);

  if (!podcast) return null;

  const isYoutube = playerMode === 'youtube';
  const isRss     = playerMode === 'rss';
  const isLoading = playerMode === 'loading';
  const isError   = playerMode === 'error';

  const {
    playing, loading: rssHwLoading, error: rssError, rssLoading,
    progress, bufferedProgress,
    currentTimeStr, durationStr,
    volume, speed,
    togglePlay, seekRelative,
    setVolume, setSpeed,
    seek, duration,
  } = rssPlayer;

  const isBusy    = isLoading || rssLoading || rssHwLoading;
  const nextSpeed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#05050A',
      display: 'flex', flexDirection: 'column',
      animation: 'fadeIn .3s ease both',
    }}>
      {/* ── Cinematic blurred background ────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <img
          src={podcast.banner || podcast.cover || podcast.hostPhoto}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(60px)', transform: 'scale(1.3)', opacity: .25 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(3,3,8,.88)' }}/>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 100%,${podcast.accent}18 0%,transparent 60%)` }}/>
      </div>

      {/* ── Scrollable inner ─────────────────────────────────────── */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', scrollbarWidth: 'none' }}>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div style={{ padding: '50px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
            <ChevDown s={26} c="rgba(255,255,255,.45)"/>
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>
              Now Playing
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: "'Syne',sans-serif", marginTop: 2 }}>
              {podcast.title}
            </div>
          </div>
          <button onClick={() => onOpenAddModal(podcast)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
            <PlusIcon s={22} c="rgba(255,255,255,.45)"/>
          </button>
        </div>

        {/* ── Content area ────────────────────────────────────────── */}
        <div style={{ flex: 1, padding: '16px 22px 0' }}>

          {/* ── YOUTUBE MODE: show embedded YouTube player ────────── */}
          {isYoutube && youtubeVideoId && (
            <YouTubeEmbed videoId={youtubeVideoId} accent={podcast.accent}/>
          )}

          {/* ── RSS / LOADING MODE: show artwork ─────────────────── */}
          {!isYoutube && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <div style={{
                width: 220, height: 220, borderRadius: 24, overflow: 'hidden',
                boxShadow: `0 30px 70px rgba(0,0,0,.9), 0 0 55px ${podcast.accent}25`,
                border: '1px solid rgba(255,255,255,.09)',
                position: 'relative',
              }}>
                <img
                  src={podcast.cover || podcast.hostPhoto}
                  alt={podcast.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                  onError={e => { e.target.src = podcast.hostPhoto || ''; }}
                />
                {/* Loading overlay */}
                {isBusy && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
                  }}>
                    <div className="dot-loader"><span/><span/><span/></div>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', fontFamily: "'DM Sans',sans-serif" }}>
                      {rssLoading ? 'Fetching episode…' : 'Loading…'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Title + heart ────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, marginTop: isYoutube ? 6 : 0 }}>
            <div style={{ flex: 1, marginRight: 12 }}>
              <div style={{
                fontSize: isYoutube ? 15 : 18, fontWeight: 900, color: '#fff', fontFamily: "'Syne',sans-serif",
                letterSpacing: '-.02em', lineHeight: 1.2,
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {episode?.title || podcast.title}
              </div>
              <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.4)', fontFamily: "'DM Sans',sans-serif", marginTop: 3 }}>
                {podcast.host}{episode?.date ? ` · ${episode.date}` : ''}
              </div>
            </div>
            <button onClick={() => setLiked(l => !l)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginTop: 2, flexShrink: 0 }}>
              <HeartIcon s={22} c={liked ? '#ef4444' : 'rgba(255,255,255,.35)'} filled={liked}/>
            </button>
          </div>

          {/* ── Waveform (RSS only) ──────────────────────────────── */}
          {isRss && (
            <div style={{ margin: '8px 0 4px' }}>
              <SoundWave playing={playing && !isBusy} accent={podcast.accent} bars={36} maxH={32}/>
            </div>
          )}

          {/* ── Status: Loading ──────────────────────────────────── */}
          {(isBusy && !isYoutube) && (
            <div style={{
              marginBottom: 8, padding: '10px 14px', borderRadius: 14,
              background: `${podcast.accent}15`, border: `1px solid ${podcast.accent}33`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: podcast.accent }}/>
              <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.65)', fontFamily: "'DM Sans',sans-serif" }}>
                {rssLoading ? 'Fetching from official RSS feed…' : 'Buffering audio…'}
              </span>
            </div>
          )}

          {/* ── Status: RSS Error ─────────────────────────────────── */}
          {(rssError || isError) && !isYoutube && (
            <div style={{
              marginBottom: 8, padding: '12px 14px', borderRadius: 14,
              background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
              fontSize: 12.5, color: '#fca5a5', fontFamily: "'DM Sans',sans-serif",
            }}>
              <div style={{ fontWeight: 700, marginBottom: 5 }}>⚠️ Direct stream unavailable</div>
              <div style={{ opacity: .8, marginBottom: 10 }}>
                Open on an official platform to listen:
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={podcast.spotifyUrl} target="_blank" rel="noopener noreferrer" style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '9px 0', background: 'rgba(30,215,96,.15)', border: '1px solid rgba(30,215,96,.3)',
                  borderRadius: 10, textDecoration: 'none', color: '#1ED760', fontSize: 12, fontWeight: 700,
                }}>
                  <SpotifyLogo s={14}/> Spotify
                </a>
                <a href={podcast.youtubeUrl} target="_blank" rel="noopener noreferrer" style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '9px 0', background: 'rgba(255,0,0,.1)', border: '1px solid rgba(255,0,0,.25)',
                  borderRadius: 10, textDecoration: 'none', color: '#FF4444', fontSize: 12, fontWeight: 700,
                }}>
                  <YTLogo s={14}/> YouTube
                </a>
              </div>
            </div>
          )}

          {/* ── RSS Controls ─────────────────────────────────────── */}
          {isRss && (
            <>
              {/* Progress bar */}
              <div style={{ marginBottom: 8 }}>
                <div
                  style={{ height: 5, background: 'rgba(255,255,255,.1)', borderRadius: 99, position: 'relative', cursor: 'pointer' }}
                  onClick={e => {
                    if (!duration) return;
                    const r = e.currentTarget.getBoundingClientRect();
                    seek(((e.clientX - r.left) / r.width) * duration);
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${bufferedProgress * 100}%`, background: 'rgba(255,255,255,.1)', borderRadius: 99 }}/>
                  <div style={{ height: '100%', width: `${progress * 100}%`, background: `linear-gradient(to right,${podcast.accent},${podcast.accent}cc)`, borderRadius: 99, position: 'relative', minWidth: progress > 0 ? 2 : 0 }}>
                    {progress > 0 && (
                      <div style={{
                        position: 'absolute', right: -7, top: '50%', transform: 'translateY(-50%)',
                        width: 14, height: 14, borderRadius: 7, background: '#fff',
                        boxShadow: `0 0 10px ${podcast.accent}`,
                      }}/>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontFamily: "'DM Sans',sans-serif" }}>{currentTimeStr}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontFamily: "'DM Sans',sans-serif" }}>{durationStr || '—'}</span>
                </div>
              </div>

              {/* Main controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <button onClick={() => seekRelative(-15)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <Rew15 s={30} c="rgba(255,255,255,.55)"/>
                </button>

                <button onClick={togglePlay} style={{
                  width: 70, height: 70, borderRadius: 35,
                  background: `linear-gradient(135deg,${podcast.accent},${podcast.accent}cc)`,
                  border: 'none', cursor: 'pointer',
                  boxShadow: `0 8px 32px ${podcast.accent}66`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform .15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {isBusy
                    ? <div className="spinner" style={{ borderTopColor: '#fff' }}/>
                    : playing
                      ? <PauseFill s={26}/>
                      : <PlayFill s={26}/>
                  }
                </button>

                <button onClick={() => seekRelative(30)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <Fwd30 s={30} c="rgba(255,255,255,.55)"/>
                </button>
              </div>

              {/* Secondary controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <button onClick={() => setSpeed(nextSpeed)} style={{
                  padding: '6px 16px', background: 'rgba(255,255,255,.07)', borderRadius: 50,
                  border: '1px solid rgba(255,255,255,.12)', cursor: 'pointer',
                  color: 'rgba(255,255,255,.7)', fontSize: 12.5, fontWeight: 700, fontFamily: "'DM Sans',sans-serif",
                }}>
                  {speed}×
                </button>

                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowVol(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
                    <VolIcon s={22} c="rgba(255,255,255,.5)" off={volume === 0}/>
                  </button>
                  {showVol && (
                    <div style={{
                      position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                      background: '#1A1A26', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16,
                      padding: '14px 10px', marginBottom: 8,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      zIndex: 10, animation: 'slideUp .2s ease both',
                    }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontFamily: "'DM Sans',sans-serif" }}>
                        {Math.round(volume * 100)}%
                      </span>
                      <input type="range" min={0} max={1} step={0.01} value={volume}
                        onChange={e => setVolume(parseFloat(e.target.value))}
                        style={{ writingMode: 'vertical-lr', direction: 'rtl', height: 80, accentColor: podcast.accent }}
                      />
                    </div>
                  )}
                </div>

                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
                  <DlIcon s={22} c="rgba(255,255,255,.5)"/>
                </button>

                <button onClick={() => setShowSleep(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
                  <MoonIcon s={22} c={showSleep ? podcast.accent : 'rgba(255,255,255,.5)'}/>
                </button>
              </div>

              {/* Sleep timer */}
              {showSleep && (
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  {['5 min','15 min','30 min','1 hr','End'].map(t => (
                    <button key={t} onClick={() => setShowSleep(false)} style={{
                      flex: 1, padding: '7px 0', background: 'rgba(255,255,255,.07)',
                      border: 'none', borderRadius: 10, cursor: 'pointer',
                      color: 'rgba(255,255,255,.65)', fontSize: 9.5, fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
                    }}>{t}</button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Open on Spotify / YouTube ─────────────────────────── */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 6, marginTop: 4 }}>
            <a href={podcast.spotifyUrl} target="_blank" rel="noopener noreferrer" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0',
              background: 'rgba(30,215,96,.08)', border: '1px solid rgba(30,215,96,.25)', borderRadius: 14,
              textDecoration: 'none', transition: 'background .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(30,215,96,.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(30,215,96,.08)'}
            >
              <SpotifyLogo s={18}/>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1ED760', fontFamily: "'DM Sans',sans-serif" }}>Open in Spotify</span>
            </a>
            <a href={podcast.youtubeUrl} target="_blank" rel="noopener noreferrer" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0',
              background: 'rgba(255,0,0,.08)', border: '1px solid rgba(255,0,0,.2)', borderRadius: 14,
              textDecoration: 'none', transition: 'background .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,0,0,.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,0,0,.08)'}
            >
              <YTLogo s={18}/>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#FF5555', fontFamily: "'DM Sans',sans-serif" }}>Watch on YouTube</span>
            </a>
          </div>

          {/* Legal note */}
          <div style={{ textAlign: 'center', padding: '4px 0 16px', fontSize: 10, color: 'rgba(255,255,255,.2)', fontFamily: "'DM Sans',sans-serif" }}>
            {isYoutube ? 'Video via official YouTube embed API' : 'Audio via official public podcast RSS feed'}
          </div>
        </div>
      </div>
    </div>
  );
}
