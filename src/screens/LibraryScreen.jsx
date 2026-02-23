import { useState } from 'react';
import { PlusIcon, ListIcon } from '../components/Icons.jsx';

/* ── Collection Detail ──────────────────────────────────────── */
export function CollectionDetail({ collection, onBack, onPodcastTap, onRemove }) {
  return (
    <div style={{ paddingBottom:120, animation:'fadeIn .35s ease both' }}>
      <div style={{ padding:'56px 20px 0' }}>
        <button onClick={onBack} style={{
          display:'flex', alignItems:'center', gap:6, background:'none', border:'none',
          color:'rgba(255,255,255,.5)', cursor:'pointer', fontSize:14, fontFamily:"'DM Sans',sans-serif",
          marginBottom:24,
        }}>‹ Your Library</button>

        {/* Cover mosaic */}
        <div style={{ width:150, height:150, borderRadius:24, overflow:'hidden', margin:'0 auto 22px', background:'#16161E', boxShadow:'0 18px 52px rgba(0,0,0,.6)' }}>
          {collection.podcasts.length === 0 ? (
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ListIcon s={46} c="rgba(255,255,255,.18)"/>
            </div>
          ) : collection.podcasts.length === 1 ? (
            <img src={collection.podcasts[0].hostPhoto} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', width:'100%', height:'100%' }}>
              {collection.podcasts.slice(0,4).map((p,i) => (
                <img key={i} src={p.hostPhoto} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              ))}
            </div>
          )}
        </div>

        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:22, fontWeight:900, color:'#fff', fontFamily:"'Syne',sans-serif", letterSpacing:'-.02em' }}>{collection.name}</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,.42)', fontFamily:"'DM Sans',sans-serif", marginTop:4 }}>{collection.podcasts.length} podcasts</div>
        </div>
      </div>

      {collection.podcasts.length === 0 ? (
        <p style={{ textAlign:'center', color:'rgba(255,255,255,.3)', fontSize:14, fontFamily:"'DM Sans',sans-serif", padding:'40px 20px' }}>
          No podcasts yet. Tap + on any card to save here.
        </p>
      ) : (
        <div style={{ padding:'0 20px' }}>
          {collection.podcasts.map(p => (
            <div key={p.id} style={{ display:'flex', gap:14, alignItems:'center', padding:'11px 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
              <div onClick={() => onPodcastTap(p)} style={{ width:56, height:56, borderRadius:14, overflow:'hidden', flexShrink:0, cursor:'pointer' }}>
                <img src={p.hostPhoto} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              </div>
              <div onClick={() => onPodcastTap(p)} style={{ flex:1, cursor:'pointer', minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#fff', fontFamily:"'Syne',sans-serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.42)', fontFamily:"'DM Sans',sans-serif", marginTop:2 }}>{p.host} · {p.episodes} eps</div>
              </div>
              <button onClick={() => onRemove(collection.id, p.id)} style={{
                background:'none', border:'none', cursor:'pointer', padding:'6px 8px',
                color:'rgba(255,255,255,.28)', fontSize:19, lineHeight:1,
              }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Library Screen ─────────────────────────────────────────── */
export default function LibraryScreen({ collections, onCollectionTap, onCreateCollection }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const create = () => {
    if (!name.trim()) return;
    onCreateCollection(name.trim());
    setName(''); setCreating(false);
  };

  return (
    <div style={{ paddingBottom:120, animation:'fadeIn .35s ease both' }}>
      <div style={{ padding:'56px 20px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h1 style={{ fontSize:28, fontWeight:900, color:'#fff', fontFamily:"'Syne',sans-serif", letterSpacing:'-.02em' }}>
          Your Library
        </h1>
        <button onClick={() => setCreating(true)} style={{
          width:38, height:38, borderRadius:14,
          background:'rgba(79,70,229,.18)', border:'1px solid rgba(79,70,229,.38)',
          display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
        }}>
          <PlusIcon s={18} c="#818cf8"/>
        </button>
      </div>

      {creating && (
        <div style={{ padding:'0 20px 20px' }}>
          <div style={{ display:'flex', gap:8 }}>
            <input
              autoFocus value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key==='Enter' && create()}
              placeholder="Collection name…"
              style={{
                flex:1, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.14)',
                borderRadius:14, padding:'12px 16px', color:'#fff', fontSize:14,
                fontFamily:"'DM Sans',sans-serif", outline:'none',
              }}
            />
            <button onClick={create} style={{
              padding:'12px 18px', background:'#4f46e5', borderRadius:14, border:'none',
              color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
            }}>Create</button>
            <button onClick={() => setCreating(false)} style={{
              padding:'12px 12px', background:'rgba(255,255,255,.08)', borderRadius:14,
              border:'none', color:'rgba(255,255,255,.5)', cursor:'pointer', fontSize:15,
            }}>✕</button>
          </div>
        </div>
      )}

      {collections.length === 0 && !creating ? (
        <div style={{ padding:'60px 20px', textAlign:'center' }}>
          <div style={{ width:80, height:80, borderRadius:24, margin:'0 auto 20px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ListIcon s={34} c="rgba(255,255,255,.2)"/>
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:'rgba(255,255,255,.38)', fontFamily:"'Syne',sans-serif", marginBottom:8 }}>No collections yet</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,.22)', fontFamily:"'DM Sans',sans-serif", marginBottom:24 }}>
            Save your favourite podcasts into collections
          </div>
          <button onClick={() => setCreating(true)} style={{
            padding:'12px 28px', background:'#4f46e5', borderRadius:50, border:'none',
            color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
            boxShadow:'0 8px 24px rgba(79,70,229,.45)',
          }}>Create Collection</button>
        </div>
      ) : (
        <div style={{ padding:'0 20px' }}>
          {collections.map(col => (
            <div key={col.id} onClick={() => onCollectionTap(col)} style={{
              display:'flex', gap:14, alignItems:'center', padding:'12px 0',
              borderBottom:'1px solid rgba(255,255,255,.05)', cursor:'pointer',
            }}>
              <div style={{ width:62, height:62, borderRadius:16, overflow:'hidden', flexShrink:0, background:'#16161E' }}>
                {col.podcasts.length === 0 ? (
                  <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <ListIcon s={26} c="rgba(255,255,255,.22)"/>
                  </div>
                ) : col.podcasts.length === 1 ? (
                  <img src={col.podcasts[0].hostPhoto} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', width:'100%', height:'100%' }}>
                    {col.podcasts.slice(0,4).map((p,i) => (
                      <img key={i} src={p.hostPhoto} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'#fff', fontFamily:"'Syne',sans-serif", marginBottom:3 }}>{col.name}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.42)', fontFamily:"'DM Sans',sans-serif" }}>
                  Collection · {col.podcasts.length} podcasts
                </div>
              </div>
              <span style={{ fontSize:20, color:'rgba(255,255,255,.2)' }}>›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
