export default function ProfileScreen({ collections }) {
  const totalSaved = [...new Set(collections.flatMap(c => c.podcasts.map(p => p.id)))].length;

  return (
    <div style={{ paddingBottom:120, animation:'fadeIn .35s ease both' }}>
      {/* Banner */}
      <div style={{ height:200, position:'relative', overflow:'hidden' }}>
        <img src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=900&q=80" alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 30%, #08080C 100%)' }}/>
      </div>

      <div style={{ padding:'0 20px 28px', marginTop:-65 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:18 }}>
          <div style={{
            width:88, height:88, borderRadius:44,
            background:'linear-gradient(135deg,#4f46e5,#2563eb)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:34, fontWeight:900, color:'#fff', fontFamily:"'Syne',sans-serif",
            border:'4px solid #08080C',
            boxShadow:'0 0 28px rgba(79,70,229,.55)',
          }}>R</div>
          <button style={{
            padding:'10px 22px', borderRadius:50,
            background:'transparent', border:'1px solid rgba(255,255,255,.22)',
            color:'#fff', fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:600, cursor:'pointer',
          }}>Edit Profile</button>
        </div>

        <div style={{ fontSize:26, fontWeight:900, color:'#fff', fontFamily:"'Syne',sans-serif", letterSpacing:'-.02em' }}>Robel</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.38)', fontFamily:"'DM Sans',sans-serif", marginTop:3, marginBottom:24 }}>
          robel@rop.fm · Premium Member ✦
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:10, marginBottom:30 }}>
          {[
            { label:'Collections', value:collections.length },
            { label:'Saved',       value:totalSaved },
            { label:'Hrs Listened',value:'312' },
          ].map(s => (
            <div key={s.label} style={{
              flex:1, padding:'15px 10px', borderRadius:18, textAlign:'center',
              background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)',
            }}>
              <div style={{ fontSize:22, fontWeight:900, color:'#fff', fontFamily:"'Syne',sans-serif" }}>{s.value}</div>
              <div style={{ fontSize:9.5, color:'rgba(255,255,255,.3)', fontFamily:"'DM Sans',sans-serif", marginTop:3, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Premium banner */}
        <div style={{
          marginBottom:24, padding:'18px 20px', borderRadius:20,
          background:'linear-gradient(135deg,rgba(79,70,229,.18),rgba(37,99,235,.18))',
          border:'1px solid rgba(79,70,229,.28)',
        }}>
          <div style={{ fontSize:13, fontWeight:800, color:'#818cf8', fontFamily:"'Syne',sans-serif", letterSpacing:'.04em', marginBottom:4 }}>
            ✦ PREMIUM ACTIVE
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.5)', fontFamily:"'DM Sans',sans-serif" }}>
            Unlimited listening · No ads · Offline downloads
          </div>
        </div>

        {/* Menu */}
        {['Audio Quality','Downloads','Notifications','Privacy & Data','Help Center','Sign Out'].map(item => (
          <div key={item} style={{
            padding:'16px 0', borderBottom:'1px solid rgba(255,255,255,.05)',
            display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer',
          }}>
            <span style={{
              fontSize:15, fontFamily:"'DM Sans',sans-serif",
              color: item === 'Sign Out' ? '#ef4444' : 'rgba(255,255,255,.7)',
              fontWeight: item === 'Sign Out' ? 600 : 400,
            }}>{item}</span>
            {item !== 'Sign Out' && <span style={{ fontSize:18, color:'rgba(255,255,255,.18)' }}>›</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
