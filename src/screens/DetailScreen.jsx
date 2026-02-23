import { useState, useEffect } from 'react';
import { getMockEpisodes } from '../data/podcasts.js';
import { loadEpisodes } from '../hooks/usePodcastPlayer.js';
import { PlayFill, PlusIcon, SpotifyLogo, YTLogo, HeartIcon } from '../components/Icons.jsx';

export default function DetailScreen({ podcast:p, onBack, onPlay, onAddToCollection, collections }) {
  const [following, setFollowing] = useState(false);
  const [episodes,  setEpisodes]  = useState(getMockEpisodes(p));
  const [epLoading, setEpLoading] = useState(true);
  const [epError,   setEpError]   = useState(false);

  const saved = collections.some(c => c.podcasts.find(x => x.id === p.id));

  // Fetch real episodes from RSS on mount
  useEffect(() => {
    let alive = true;
    setEpLoading(true);
    setEpError(false);
    loadEpisodes(p).then(eps => {
      if (!alive) return;
      if (eps.length > 0) setEpisodes(eps);
      else setEpError(true);
      setEpLoading(false);
    }).catch(() => {
      if (!alive) return;
      setEpError(true);
      setEpLoading(false);
    });
    return () => { alive = false; };
  }, [p.id]); // eslint-disable-line

  return (
    <div style={{ paddingBottom:120, animation:'fadeIn .38s ease both' }}>
      {/* Banner image */}
      <div style={{ position:'relative', height:320, flexShrink:0, overflow:'hidden' }}>
        <img
          src={p.banner || p.cover || p.hostPhoto}
          alt={p.title}
          style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top', display:'block' }}
        />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, #08080C 0%, rgba(8,8,12,.15) 55%, rgba(8,8,12,.45) 100%)' }}/>
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 30% 60%,${p.accent}18 0%,transparent 60%)` }}/>

        {(p.isNew || p.isUpdated) && (
          <span style={{
            position:'absolute', top:60, left:64,
            padding:'4px 12px', borderRadius:99, fontSize:9.5, fontWeight:800,
            fontFamily:"'Syne',sans-serif", letterSpacing:'.07em', textTransform:'uppercase', color:'#fff',
            background: p.isNew ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'linear-gradient(135deg,#2563eb,#1d4ed8)',
            boxShadow:`0 2px 12px ${p.isNew?'rgba(79,70,229,.7)':'rgba(37,99,235,.7)'}`,
          }}>
            {p.isNew ? '🆕 New Show' : '🔔 New Episode'}
          </span>
        )}

        <button onClick={onBack} style={{
          position:'absolute', top:54, left:16,
          width:38, height:38, borderRadius:14,
          background:'rgba(0,0,0,.55)', backdropFilter:'blur(16px)',
          border:'1px solid rgba(255,255,255,.14)', color:'#fff',
          fontSize:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
        }}>‹</button>
      </div>

      <div style={{ padding:'0 20px', marginTop:-60, position:'relative', zIndex:2 }}>
        {/* Host circle + title */}
        <div style={{ display:'flex', gap:16, alignItems:'flex-end', marginBottom:14 }}>
          <div style={{
            width:90, height:90, borderRadius:45, overflow:'hidden', flexShrink:0,
            border:'4px solid #08080C',
            boxShadow:`0 8px 28px rgba(0,0,0,.6), 0 0 0 2px ${p.accent}44`,
          }}>
            <img src={p.hostPhoto} alt={p.host} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }}/>
          </div>
          <div style={{ flex:1, paddingBottom:4 }}>
            <div style={{ fontSize:9.5, letterSpacing:'.13em', textTransform:'uppercase', color:p.accent, fontFamily:"'Syne',sans-serif", fontWeight:800, marginBottom:5 }}>
              {p.category}
            </div>
            <div style={{ fontSize:20, fontWeight:900, color:'#fff', fontFamily:"'Syne',sans-serif", lineHeight:1.15 }}>
              {p.title}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <span style={{ fontSize:13, color:'rgba(255,255,255,.42)', fontFamily:"'DM Sans',sans-serif" }}>by {p.host}</span>
          <span style={{ width:3, height:3, borderRadius:2, background:'rgba(255,255,255,.2)' }}/>
          <span style={{ fontSize:11, color:'#fbbf24' }}>{'★'.repeat(5)}</span>
          <span style={{ fontSize:12.5, color:'rgba(255,255,255,.4)', fontFamily:"'DM Sans',sans-serif" }}>{p.rating}</span>
          <span style={{ width:3, height:3, borderRadius:2, background:'rgba(255,255,255,.2)' }}/>
          <span style={{ fontSize:12.5, color:'rgba(255,255,255,.4)', fontFamily:"'DM Sans',sans-serif" }}>{p.episodes} eps</span>
        </div>

        <p style={{ fontSize:13.5, color:'rgba(255,255,255,.45)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.65, marginBottom:20 }}>
          {p.desc}
        </p>

        {/* Action row */}
        <div style={{ display:'flex', gap:10, marginBottom:20 }}>
          <button onClick={() => onPlay(p, episodes[0])} style={{
            flex:1, padding:'14px', borderRadius:50,
            background:`linear-gradient(135deg,${p.accent},${p.accent}cc)`,
            border:'none', color:'#fff', fontSize:15, fontFamily:"'Syne',sans-serif",
            fontWeight:800, cursor:'pointer',
            boxShadow:`0 8px 26px ${p.accent}50`,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            transition:'transform .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform='scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
          >
            <PlayFill s={15}/> Play Latest
          </button>
          <button onClick={() => setFollowing(f => !f)} style={{
            padding:'14px 18px', borderRadius:50,
            background: following ? 'rgba(255,255,255,.1)' : 'transparent',
            border:'1px solid rgba(255,255,255,.2)',
            color:'#fff', fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:700, cursor:'pointer',
          }}>
            {following ? '✓ Following' : 'Follow'}
          </button>
          <button onClick={() => onAddToCollection(p)} style={{
            width:50, height:50, borderRadius:25, flexShrink:0,
            background: saved ? 'rgba(79,70,229,.2)' : 'rgba(255,255,255,.07)',
            border:`1px solid ${saved ? '#818cf8' : 'rgba(255,255,255,.14)'}`,
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <PlusIcon s={20} c={saved ? '#818cf8' : 'rgba(255,255,255,.4)'}/>
          </button>
        </div>

        {/* Streaming links */}
        <div style={{ marginBottom:26 }}>
          <div style={{ fontSize:10.5, fontWeight:800, color:'rgba(255,255,255,.28)', fontFamily:"'Syne',sans-serif", letterSpacing:'.09em', textTransform:'uppercase', marginBottom:10 }}>
            Also available on
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <a href={p.spotifyUrl} target="_blank" rel="noopener noreferrer" style={{
              flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px 0',
              background:'rgba(30,215,96,.09)', border:'1px solid rgba(30,215,96,.25)', borderRadius:16,
              textDecoration:'none',
            }}>
              <SpotifyLogo s={20}/>
              <span style={{ fontSize:13, fontWeight:700, color:'#1ED760', fontFamily:"'DM Sans',sans-serif" }}>Spotify</span>
            </a>
            <a href={p.youtubeUrl} target="_blank" rel="noopener noreferrer" style={{
              flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px 0',
              background:'rgba(255,0,0,.09)', border:'1px solid rgba(255,0,0,.22)', borderRadius:16,
              textDecoration:'none',
            }}>
              <YTLogo s={20}/>
              <span style={{ fontSize:13, fontWeight:700, color:'#FF5555', fontFamily:"'DM Sans',sans-serif" }}>YouTube</span>
            </a>
          </div>
        </div>

        {/* Episodes */}
        <div style={{ fontSize:18, fontWeight:800, color:'#fff', fontFamily:"'Syne',sans-serif", letterSpacing:'-.01em', marginBottom:14 }}>
          {epLoading ? 'Loading episodes…' : epError ? 'Episodes' : `Episodes (${episodes.length})`}
        </div>

        {/* RSS badge */}
        <div style={{
          marginBottom:14, padding:'8px 14px', borderRadius:12,
          background: epError ? 'rgba(239,68,68,.08)' : 'rgba(255,255,255,.04)',
          border:`1px solid ${epError ? 'rgba(239,68,68,.25)' : 'rgba(255,255,255,.07)'}`,
          display:'flex', alignItems:'center', gap:8,
        }}>
          {epLoading ? (
            <>
              <div className="spinner" style={{ width:14, height:14, borderWidth:2 }}/>
              <span style={{ fontSize:11.5, color:'rgba(255,255,255,.4)', fontFamily:"'DM Sans',sans-serif" }}>
                Loading from official RSS feed…
              </span>
            </>
          ) : epError ? (
            <span style={{ fontSize:11.5, color:'#fca5a5', fontFamily:"'DM Sans',sans-serif" }}>
              ⚠️ Could not load RSS episodes — tap Spotify or YouTube above
            </span>
          ) : (
            <span style={{ fontSize:11, color:'rgba(255,255,255,.35)', fontFamily:"'DM Sans',sans-serif" }}>
              🎙 Live from official RSS feed · {episodes.length} episodes loaded
            </span>
          )}
        </div>

        {episodes.map((ep, idx) => (
          <div
            key={ep.id}
            onClick={() => onPlay(p, ep)}
            style={{
              display:'flex', gap:14, padding:'13px 0',
              borderBottom:'1px solid rgba(255,255,255,.05)', cursor:'pointer',
            }}
          >
            <div style={{ width:54, height:54, borderRadius:14, overflow:'hidden', flexShrink:0, position:'relative' }}>
              <img src={p.hostPhoto} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }}/>
              <div style={{
                position:'absolute', inset:0,
                background: idx === 0 ? `${p.accent}88` : 'rgba(0,0,0,.35)',
                display:'flex', alignItems:'center', justifyContent:'center',
                opacity: idx === 0 ? 1 : 0, transition:'opacity .2s',
              }}>
                <PlayFill s={15}/>
              </div>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{
                fontSize:14, fontWeight:700, color: ep.audioUrl ? '#fff' : 'rgba(255,255,255,.55)',
                fontFamily:"'Syne',sans-serif", marginBottom:4, lineHeight:1.3,
                overflow:'hidden', textOverflow:'ellipsis',
                display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
              }}>
                {ep.title}
              </div>
              <div style={{ fontSize:11.5, color:'rgba(255,255,255,.35)', fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', gap:8 }}>
                {ep.date && <span>{ep.date}</span>}
                {ep.duration && <><span>·</span><span>{ep.duration}</span></>}
                {!ep.audioUrl && <span style={{ color:p.accent, fontSize:10, fontWeight:700 }}>Open on Spotify →</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
