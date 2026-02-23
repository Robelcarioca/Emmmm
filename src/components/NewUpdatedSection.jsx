import { BellIcon, SpotifyLogo, YTLogo } from './Icons.jsx';
import { PODCASTS } from '../data/podcasts.js';

export default function NewUpdatedSection({ onPodcastTap }) {
  const items = PODCASTS.filter(p => p.isNew || p.isUpdated);
  if (!items.length) return null;

  return (
    <div style={{ marginBottom:32 }}>
      {/* Section header */}
      <div style={{ padding:'0 20px 14px', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{
          width:34, height:34, borderRadius:11,
          background:'rgba(79,70,229,.18)', border:'1px solid rgba(79,70,229,.38)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <BellIcon s={16} c="#818cf8" />
        </div>
        <div>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff', fontFamily:"'Syne',sans-serif", letterSpacing:'-.01em' }}>
            New & Updated
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.35)', fontFamily:"'DM Sans',sans-serif", marginTop:1 }}>
            Fresh drops · Coming soon
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:10, padding:'0 16px' }}>
        {items.map(p => (
          <NewCard key={p.id} p={p} onTap={onPodcastTap} />
        ))}
      </div>
    </div>
  );
}

function NewCard({ p, onTap }) {
  const isNew  = p.isNew;
  const clr    = isNew ? '#4f46e5' : '#2563eb';
  const label  = isNew ? '🆕 New Show' : '🔔 New Episode';

  return (
    <div style={{
      borderRadius:20, overflow:'hidden',
      background:'rgba(255,255,255,.035)',
      border:`1px solid ${clr}28`,
      boxShadow:`inset 0 0 40px ${clr}08`,
    }}>
      {/* Accent strip */}
      <div style={{ height:2, background:`linear-gradient(to right,${clr},${clr}33)` }}/>

      <div style={{ padding:'14px 16px', display:'flex', gap:14, alignItems:'center' }}>
        <div onClick={() => onTap(p)} style={{
          width:58, height:58, borderRadius:14, overflow:'hidden', flexShrink:0, cursor:'pointer',
          position:'relative', border:`2px solid ${clr}44`,
          boxShadow:`0 0 18px ${clr}33`,
        }}>
          <img src={p.hostPhoto} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
        </div>

        <div onClick={() => onTap(p)} style={{ flex:1, cursor:'pointer', minWidth:0 }}>
          <span style={{
            display:'inline-block', padding:'2px 9px', borderRadius:99, fontSize:9, fontWeight:800,
            fontFamily:"'Syne',sans-serif", letterSpacing:'.07em',
            color:clr, background:`${clr}18`, border:`1px solid ${clr}44`, marginBottom:5,
          }}>{label}</span>
          <div style={{ fontSize:14, fontWeight:700, color:'#fff', fontFamily:"'Syne',sans-serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {p.title}
          </div>
          <div style={{ fontSize:11.5, color:'rgba(255,255,255,.4)', fontFamily:"'DM Sans',sans-serif", marginTop:2 }}>
            {p.host} · {p.nextEpisode}
          </div>
        </div>
      </div>

      {/* Links */}
      <div style={{ padding:'0 16px 14px', display:'flex', gap:8 }}>
        <a href={p.spotifyUrl} target="_blank" rel="noopener noreferrer" style={{
          flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'9px 0',
          background:'rgba(30,215,96,.1)', border:'1px solid rgba(30,215,96,.28)', borderRadius:12,
          textDecoration:'none', transition:'background .2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(30,215,96,.2)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(30,215,96,.1)'}
        >
          <SpotifyLogo s={16}/>
          <span style={{ fontSize:11.5, fontWeight:700, color:'#1ED760', fontFamily:"'DM Sans',sans-serif" }}>Spotify</span>
        </a>
        <a href={p.youtubeUrl} target="_blank" rel="noopener noreferrer" style={{
          flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'9px 0',
          background:'rgba(255,0,0,.1)', border:'1px solid rgba(255,0,0,.25)', borderRadius:12,
          textDecoration:'none', transition:'background .2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,0,0,.2)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(255,0,0,.1)'}
        >
          <YTLogo s={16}/>
          <span style={{ fontSize:11.5, fontWeight:700, color:'#FF4444', fontFamily:"'DM Sans',sans-serif" }}>YouTube</span>
        </a>
      </div>
    </div>
  );
}
