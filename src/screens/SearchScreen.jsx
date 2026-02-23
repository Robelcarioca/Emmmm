import { useState } from 'react';
import { PODCASTS } from '../data/podcasts.js';
import { SearchIcon, PlusIcon } from '../components/Icons.jsx';

const CATS = [
  { id:'Science',     img:PODCASTS.find(p=>p.id===2).hostPhoto, clr:'#7c3aed' },
  { id:'AI & Tech',   img:PODCASTS.find(p=>p.id===1).hostPhoto, clr:'#4f46e5' },
  { id:'Business',    img:PODCASTS.find(p=>p.id===5).hostPhoto, clr:'#6d28d9' },
  { id:'History',     img:PODCASTS.find(p=>p.id===6).hostPhoto, clr:'#92400e' },
  { id:'Philosophy',  img:PODCASTS.find(p=>p.id===7).hostPhoto, clr:'#1d4ed8' },
  { id:'Motivation',  img:PODCASTS.find(p=>p.id===8).hostPhoto, clr:'#0e7490' },
  { id:'Conversations',img:PODCASTS.find(p=>p.id===3).hostPhoto,clr:'#2563eb' },
  { id:'Technology',  img:PODCASTS.find(p=>p.id===10).hostPhoto,clr:'#4f46e5' },
];

export default function SearchScreen({ onPodcastTap, onAdd }) {
  const [q, setQ] = useState('');
  const results = q.length > 1
    ? PODCASTS.filter(p =>
        [p.title, p.host, p.category, p.desc].join(' ').toLowerCase().includes(q.toLowerCase()))
    : [];

  return (
    <div style={{ paddingBottom:120, animation:'fadeIn .35s ease both' }}>
      <div style={{ padding:'56px 20px 20px' }}>
        <h1 style={{ fontSize:28, fontWeight:900, color:'#fff', fontFamily:"'Syne',sans-serif", letterSpacing:'-.02em', marginBottom:16 }}>
          Search
        </h1>
        <div style={{ position:'relative' }}>
          <div style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)' }}>
            <SearchIcon s={16} c="rgba(255,255,255,.35)"/>
          </div>
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Podcasts, hosts, topics…"
            style={{
              width:'100%', padding:'14px 20px 14px 46px',
              background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)',
              borderRadius:18, color:'#fff', fontSize:14.5, fontFamily:"'DM Sans',sans-serif",
              outline:'none',
            }}
          />
        </div>
      </div>

      {q.length > 1 ? (
        <div style={{ padding:'0 20px' }}>
          <p style={{ fontSize:12, color:'rgba(255,255,255,.3)', fontFamily:"'DM Sans',sans-serif", marginBottom:16 }}>
            {results.length} result{results.length !== 1 ? 's' : ''} for "{q}"
          </p>
          {results.length === 0 && (
            <p style={{ color:'rgba(255,255,255,.35)', fontSize:14, fontFamily:"'DM Sans',sans-serif", textAlign:'center', padding:'40px 0' }}>
              Nothing found. Try a different search.
            </p>
          )}
          {results.map(p => (
            <div key={p.id} style={{ display:'flex', gap:14, padding:'11px 0', borderBottom:'1px solid rgba(255,255,255,.05)', alignItems:'center' }}>
              <div onClick={() => onPodcastTap(p)} style={{ width:54, height:54, borderRadius:27, overflow:'hidden', flexShrink:0, cursor:'pointer', border:`2px solid ${p.accent}44` }}>
                <img src={p.hostPhoto} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              </div>
              <div onClick={() => onPodcastTap(p)} style={{ flex:1, cursor:'pointer', minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#fff', fontFamily:"'Syne',sans-serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.42)', fontFamily:"'DM Sans',sans-serif", marginTop:2 }}>{p.host} · {p.category}</div>
                {(p.isNew || p.isUpdated) && (
                  <span style={{ fontSize:9, fontWeight:800, color: p.isNew ? '#818cf8' : '#60a5fa', letterSpacing:'.06em', fontFamily:"'Syne',sans-serif" }}>
                    {p.isNew ? '● New Show' : '● New Episode'}
                  </span>
                )}
              </div>
              <button onClick={() => onAdd(p)} style={{ background:'none', border:'none', cursor:'pointer', padding:6, flexShrink:0 }}>
                <PlusIcon s={20} c="rgba(255,255,255,.35)"/>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* Trending */}
          <div style={{ padding:'0 20px 20px' }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.3)', fontFamily:"'Syne',sans-serif", fontWeight:800, letterSpacing:'.08em', marginBottom:14 }}>
              TRENDING
            </div>
            {['Quantum Physics & Consciousness','AI & the Future of Work','History\'s Darkest Secrets','Stoic Philosophy for Leaders','Neuroplasticity & Performance'].map(t => (
              <div key={t} onClick={() => setQ(t.split(' ')[0])} style={{
                padding:'13px 0', borderBottom:'1px solid rgba(255,255,255,.05)',
                display:'flex', alignItems:'center', gap:12, cursor:'pointer',
              }}>
                <span style={{ fontSize:13, color:'rgba(255,255,255,.28)' }}>↗</span>
                <span style={{ fontSize:15, color:'rgba(255,255,255,.72)', fontFamily:"'DM Sans',sans-serif" }}>{t}</span>
              </div>
            ))}
          </div>

          {/* Browse grid */}
          <div style={{ padding:'0 20px' }}>
            <div style={{ fontSize:17, fontWeight:800, color:'#fff', fontFamily:"'Syne',sans-serif", letterSpacing:'-.01em', marginBottom:14 }}>
              Browse All
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {CATS.map(cat => (
                <div key={cat.id} onClick={() => setQ(cat.id)} style={{
                  height:88, borderRadius:18, overflow:'hidden', position:'relative', cursor:'pointer',
                  boxShadow:'0 4px 18px rgba(0,0,0,.45)',
                }}>
                  <img src={cat.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${cat.clr}cc 0%,rgba(0,0,0,.45) 100%)` }}/>
                  <span style={{ position:'absolute', bottom:12, left:14, fontSize:14, fontWeight:800, color:'#fff', fontFamily:"'Syne',sans-serif" }}>{cat.id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
