import { useState, useEffect, useRef, useCallback } from 'react';
import { HERO_PODCASTS } from '../data/podcasts.js';
import { PlayFill, PlusIcon } from './Icons.jsx';
import { SoundWave } from './SoundWave.jsx';

const INTERVAL = 7000;

export default function HeroCarousel({ onPodcastTap, onAdd }) {
  const [idx,       setIdx]       = useState(0);
  const [inTransit, setInTransit] = useState(false);
  const timerRef    = useRef(null);
  const touchX      = useRef(null);

  const current = HERO_PODCASTS[idx];

  const advance = useCallback(() => {
    setInTransit(true);
    setTimeout(() => {
      setIdx(i => (i + 1) % HERO_PODCASTS.length);
      setInTransit(false);
    }, 350);
  }, []);

  const goTo = useCallback((next) => {
    if (inTransit || next === idx) return;
    clearInterval(timerRef.current);
    setInTransit(true);
    setTimeout(() => {
      setIdx(next);
      setInTransit(false);
      timerRef.current = setInterval(advance, INTERVAL);
    }, 350);
  }, [idx, inTransit, advance]);

  useEffect(() => {
    timerRef.current = setInterval(advance, INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [advance]);

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) {
      goTo(dx < 0
        ? (idx + 1) % HERO_PODCASTS.length
        : (idx - 1 + HERO_PODCASTS.length) % HERO_PODCASTS.length
      );
    }
    touchX.current = null;
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ position:'relative', height:540, overflow:'hidden', flexShrink:0 }}
    >
      {/* ── Slides ────────────────────────────────────────────── */}
      {HERO_PODCASTS.map((p, i) => (
        <div key={p.id} style={{
          position:'absolute', inset:0,
          opacity: i === idx ? (inTransit ? 0 : 1) : 0,
          transition:'opacity .5s ease',
          animation: i === idx && !inTransit ? `heroZoom ${INTERVAL}ms linear both` : 'none',
        }}>
          <img
            src={p.banner || p.cover || p.hostPhoto}
            alt=""
            style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center', display:'block' }}
          />
        </div>
      ))}

      {/* ── Gradients ─────────────────────────────────────────── */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        background:'linear-gradient(to top, #08080C 0%, rgba(8,8,12,.6) 50%, rgba(8,8,12,.25) 75%, rgba(8,8,12,.5) 100%)',
      }}/>
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        background:`radial-gradient(ellipse at 25% 70%, ${current.accent}20 0%, transparent 55%)`,
        transition:'background .6s ease',
      }}/>

      {/* ── Top bar ───────────────────────────────────────────── */}
      <div style={{
        position:'absolute', top:16, left:20, right:20,
        display:'flex', alignItems:'center', justifyContent:'space-between', zIndex:20,
      }}>
        <div style={{
          fontSize:22, fontWeight:900, fontFamily:"'Syne',sans-serif", letterSpacing:'-.03em',
          background:'linear-gradient(135deg,#818cf8,#60a5fa)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        }}>
          ROP
        </div>

        {/* Dots */}
        <div style={{ display:'flex', gap:6 }}>
          {HERO_PODCASTS.map((_,i) => (
            <div key={i} onClick={() => goTo(i)} style={{
              width: i===idx ? 22 : 6, height:6, borderRadius:3, cursor:'pointer',
              background: i===idx ? current.accent : 'rgba(255,255,255,.28)',
              boxShadow: i===idx ? `0 0 10px ${current.accent}` : 'none',
              transition:'all .35s ease',
            }}/>
          ))}
        </div>

        {/* Host thumbnail */}
        <div style={{
          width:42, height:42, borderRadius:21, overflow:'hidden',
          border:`2px solid ${current.accent}55`,
          boxShadow:`0 0 18px ${current.accent}44`,
        }}>
          <img src={current.hostPhoto} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }}/>
        </div>
      </div>

      {/* ── Badges ────────────────────────────────────────────── */}
      <div style={{ position:'absolute', top:76, left:20, display:'flex', gap:8, zIndex:20, flexWrap:'wrap' }}>
        {(current.isNew || current.isUpdated) && (
          <span style={{
            padding:'3.5px 12px', borderRadius:99, fontSize:9.5, fontWeight:800,
            fontFamily:"'Syne',sans-serif", letterSpacing:'.07em', textTransform:'uppercase', color:'#fff',
            background: current.isNew
              ? 'linear-gradient(135deg,#4f46e5,#7c3aed)'
              : 'linear-gradient(135deg,#2563eb,#1d4ed8)',
            boxShadow: current.isNew
              ? '0 2px 14px rgba(79,70,229,.7)'
              : '0 2px 14px rgba(37,99,235,.7)',
          }}>
            {current.isNew ? '🆕 New Show' : '🔔 New Episode'}
          </span>
        )}
        {/* Live badge */}
        <span style={{
          padding:'3.5px 12px', borderRadius:99, fontSize:9.5, fontWeight:700,
          fontFamily:"'Syne',sans-serif", letterSpacing:'.07em', textTransform:'uppercase',
          color:'rgba(255,255,255,.75)',
          background:'rgba(0,0,0,.55)', backdropFilter:'blur(8px)',
          border:'1px solid rgba(255,255,255,.16)',
          display:'flex', alignItems:'center', gap:5,
        }}>
          <span style={{ width:6, height:6, borderRadius:3, background:'#4f46e5', animation:'pulse 1.5s infinite' }}/>
          RSS LIVE
        </span>
      </div>

      {/* ── Bottom content ─────────────────────────────────────── */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'0 20px 26px', zIndex:20 }}>
        <p style={{
          fontSize:10, letterSpacing:'.14em', textTransform:'uppercase',
          color:current.accent, fontFamily:"'Syne',sans-serif", fontWeight:700, marginBottom:7,
          animation:'slideUp .4s ease both',
        }}>{current.category}</p>

        <h1 style={{
          fontSize:28, fontWeight:900, color:'#fff', lineHeight:1.12,
          fontFamily:"'Syne',sans-serif", letterSpacing:'-.025em', marginBottom:8,
          textShadow:'0 2px 30px rgba(0,0,0,.65)',
          animation:'slideUp .4s .07s ease both',
        }}>{current.title}</h1>

        <div style={{
          display:'flex', alignItems:'center', gap:10, marginBottom:8,
          animation:'slideUp .4s .13s ease both',
        }}>
          <span style={{ fontSize:12.5, color:'rgba(255,255,255,.5)', fontFamily:"'DM Sans',sans-serif" }}>
            by {current.host}
          </span>
          <span style={{ width:3, height:3, borderRadius:2, background:'rgba(255,255,255,.25)' }}/>
          <span style={{ fontSize:12, color:'rgba(255,255,255,.5)', fontFamily:"'DM Sans',sans-serif" }}>
            {current.episodes.toLocaleString()} eps
          </span>
          <span style={{ width:3, height:3, borderRadius:2, background:'rgba(255,255,255,.25)' }}/>
          <span style={{ fontSize:12, color:'#fbbf24' }}>★ {current.rating}</span>
        </div>

        <p style={{
          fontSize:12.5, color:'rgba(255,255,255,.42)', lineHeight:1.62, marginBottom:14,
          fontFamily:"'DM Sans',sans-serif", maxWidth:310,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
          animation:'slideUp .4s .18s ease both',
        }}>{current.desc}</p>

        {/* Animated waveform (static beauty) */}
        <div style={{ marginBottom:18, animation:'fadeIn .6s .3s ease both' }}>
          <SoundWave playing={true} accent={current.accent} bars={28} maxH={24}/>
        </div>

        <div style={{ display:'flex', gap:10, animation:'slideUp .4s .24s ease both' }}>
          <button onClick={() => onPodcastTap(current)} style={{
            display:'flex', alignItems:'center', gap:8, padding:'12px 26px',
            background:'#fff', borderRadius:50, border:'none', cursor:'pointer',
            fontSize:13.5, fontWeight:800, fontFamily:"'Syne',sans-serif", color:'#08080C',
            boxShadow:'0 4px 22px rgba(0,0,0,.5)', transition:'transform .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform='scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
          >
            <PlayFill s={14} c="#08080C"/> Play
          </button>
          <button onClick={() => onAdd(current)} style={{
            display:'flex', alignItems:'center', gap:7, padding:'12px 20px',
            background:'rgba(255,255,255,.1)', borderRadius:50,
            border:'1px solid rgba(255,255,255,.22)', cursor:'pointer',
            fontSize:13.5, fontWeight:600, fontFamily:"'DM Sans',sans-serif", color:'#fff',
            backdropFilter:'blur(10px)', transition:'background .2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.2)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,.1)'}
          >
            <PlusIcon s={14} c="#fff"/> Save
          </button>
        </div>
      </div>
    </div>
  );
}
