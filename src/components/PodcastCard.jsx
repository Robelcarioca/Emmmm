import { useState } from 'react';
import { PlayFill, PlusIcon } from './Icons.jsx';

export default function PodcastCard({ podcast:p, onTap, onAdd, size=148 }) {
  const [pressed, setPressed] = useState(false);
  const [loaded,  setLoaded]  = useState(false);

  return (
    <div
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        minWidth:size, width:size, flexShrink:0, cursor:'pointer',
        transform: pressed ? 'scale(.92)' : 'scale(1)',
        transition:'transform .18s ease',
        animation:'slideIn .38s ease both',
      }}
    >
      {/* Square photo */}
      <div style={{
        width:size, height:size, borderRadius:16, overflow:'hidden',
        position:'relative', marginBottom:10,
        boxShadow:`0 8px 28px rgba(0,0,0,.6)`,
        transition:'box-shadow .22s',
      }}
        onMouseEnter={e => e.currentTarget.style.boxShadow=`0 12px 36px rgba(0,0,0,.7), 0 0 0 2px ${p.accent}55`}
        onMouseLeave={e => e.currentTarget.style.boxShadow=`0 8px 28px rgba(0,0,0,.6)`}
      >
        {!loaded && <div className="skel" style={{ position:'absolute', inset:0, borderRadius:0 }}/>}
        <img
          src={p.hostPhoto} alt={p.host}
          onLoad={() => setLoaded(true)}
          onClick={() => onTap(p)}
          style={{ width:'100%', height:'100%', objectFit:'cover', opacity:loaded?1:0, transition:'opacity .3s' }}
        />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 55%)', pointerEvents:'none' }}/>

        {/* Badge */}
        {(p.isNew || p.isUpdated) && (
          <span style={{
            position:'absolute', top:8, left:8,
            padding:'2.5px 8px', borderRadius:99,
            fontSize:8.5, fontWeight:800, fontFamily:"'Syne',sans-serif",
            letterSpacing:'.07em', textTransform:'uppercase', color:'#fff',
            background: p.isNew
              ? 'linear-gradient(135deg,#4f46e5,#7c3aed)'
              : 'linear-gradient(135deg,#2563eb,#1d4ed8)',
            boxShadow: `0 1px 8px ${p.isNew?'rgba(79,70,229,.65)':'rgba(37,99,235,.65)'}`,
          }}>
            {p.isNew ? 'New' : 'Updated'}
          </span>
        )}

        {/* Play */}
        <div onClick={() => onTap(p)} style={{
          position:'absolute', bottom:8, right:8,
          width:34, height:34, borderRadius:17,
          background:p.accent, display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:`0 4px 14px ${p.accent}88`,
          transition:'transform .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.transform='scale(1.12)'}
          onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
        >
          <PlayFill s={12} />
        </div>

        {/* Add */}
        <button onClick={e => { e.stopPropagation(); onAdd(p); }} style={{
          position:'absolute', top:8, right:8,
          width:27, height:27, borderRadius:14,
          background:'rgba(0,0,0,.62)', backdropFilter:'blur(8px)',
          border:'1px solid rgba(255,255,255,.22)',
          display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
        }}>
          <PlusIcon s={12} c="rgba(255,255,255,.88)" />
        </button>
      </div>

      {/* Label */}
      <div onClick={() => onTap(p)}>
        <div style={{
          fontSize:13.5, fontWeight:700, color:'#fff', fontFamily:"'Syne',sans-serif",
          lineHeight:1.25, marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        }}>{p.title}</div>
        <div style={{ fontSize:11.5, color:'rgba(255,255,255,.4)', fontFamily:"'DM Sans',sans-serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {p.host}
        </div>
      </div>
    </div>
  );
}
