import { useState } from 'react';
import { PlusIcon, CheckIcon, ListIcon } from './Icons.jsx';

export default function AddToCollectionModal({ podcast, collections, onAdd, onCreate, onClose }) {
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const create = () => {
    if (!newName.trim()) return;
    onCreate(newName.trim(), podcast);
    setCreating(false); setNewName(''); onClose();
  };

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:500,
      background:'rgba(0,0,0,.85)', backdropFilter:'blur(12px)',
      display:'flex', alignItems:'flex-end', justifyContent:'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width:'100%', maxWidth:430,
        background:'#14141C', borderRadius:'26px 26px 0 0',
        border:'1px solid rgba(255,255,255,.09)',
        boxShadow:'0 -20px 60px rgba(0,0,0,.7)',
        maxHeight:'82vh', display:'flex', flexDirection:'column',
        animation:'slideUp .35s ease both',
      }}>
        <div style={{ display:'flex', justifyContent:'center', padding:'14px 0 0', flexShrink:0 }}>
          <div style={{ width:38, height:4, borderRadius:99, background:'rgba(255,255,255,.18)' }}/>
        </div>

        <div style={{ display:'flex', gap:14, alignItems:'center', padding:'16px 22px 14px', flexShrink:0 }}>
          <div style={{ width:50, height:50, borderRadius:14, overflow:'hidden', flexShrink:0 }}>
            <img src={podcast.hostPhoto} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#fff', fontFamily:"'Syne',sans-serif" }}>{podcast.title}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.42)', fontFamily:"'DM Sans',sans-serif" }}>Save to collection</div>
          </div>
        </div>

        <div style={{ height:1, background:'rgba(255,255,255,.07)', margin:'0 22px', flexShrink:0 }}/>

        <div style={{ padding:'14px 22px 8px', flexShrink:0 }}>
          {creating ? (
            <div style={{ display:'flex', gap:8 }}>
              <input
                autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key==='Enter' && create()}
                placeholder="Collection name…"
                style={{
                  flex:1, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.14)',
                  borderRadius:12, padding:'11px 14px', color:'#fff', fontSize:14,
                  fontFamily:"'DM Sans',sans-serif", outline:'none',
                }}
              />
              <button onClick={create} style={{
                padding:'11px 16px', background:'#4f46e5', borderRadius:12, border:'none',
                color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
              }}>Create</button>
              <button onClick={() => setCreating(false)} style={{
                padding:'11px 12px', background:'rgba(255,255,255,.08)', borderRadius:12,
                border:'none', color:'rgba(255,255,255,.5)', cursor:'pointer', fontSize:15,
              }}>✕</button>
            </div>
          ) : (
            <button onClick={() => setCreating(true)} style={{
              width:'100%', padding:'13px', background:'rgba(79,70,229,.12)',
              border:'1px dashed rgba(79,70,229,.45)', borderRadius:14, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              color:'#818cf8', fontSize:14, fontWeight:700, fontFamily:"'DM Sans',sans-serif",
            }}>
              <PlusIcon s={16} c="#818cf8"/> New Collection
            </button>
          )}
        </div>

        <div style={{ overflowY:'auto', flex:1, padding:'0 22px 24px' }}>
          {collections.length === 0 && (
            <p style={{ textAlign:'center', color:'rgba(255,255,255,.35)', fontSize:13, fontFamily:"'DM Sans',sans-serif", padding:'24px 0' }}>
              No collections yet.
            </p>
          )}
          {collections.map(col => {
            const has = col.podcasts.some(p => p.id === podcast.id);
            return (
              <div key={col.id} onClick={() => { if (!has) { onAdd(col.id, podcast); onClose(); } }} style={{
                display:'flex', alignItems:'center', gap:14, padding:'12px 0',
                borderBottom:'1px solid rgba(255,255,255,.05)',
                cursor: has ? 'default' : 'pointer', opacity: has ? .55 : 1,
              }}>
                <div style={{
                  width:44, height:44, borderRadius:12, overflow:'hidden', flexShrink:0,
                  background:'#1A1A24', display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  {col.podcasts[0]
                    ? <img src={col.podcasts[0].hostPhoto} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    : <ListIcon s={20} c="rgba(255,255,255,.25)"/>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'#fff', fontFamily:"'Syne',sans-serif" }}>{col.name}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.42)', fontFamily:"'DM Sans',sans-serif" }}>{col.podcasts.length} podcasts</div>
                </div>
                {has ? <CheckIcon s={18} c="#818cf8"/> : <PlusIcon s={18} c="rgba(255,255,255,.4)"/>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
