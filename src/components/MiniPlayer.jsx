import { PlayFill, PauseFill } from './Icons.jsx';
import { MiniWave } from './SoundWave.jsx';

export default function MiniPlayer({ podcast, episode, playing, onToggle, onExpand }) {
  if (!podcast || !episode) return null;

  return (
    <div onClick={onExpand} style={{
      position:'fixed', bottom:80, left:'50%', transform:'translateX(-50%)',
      width:'calc(100% - 20px)', maxWidth:410,
      background:'rgba(18,18,26,.97)', backdropFilter:'blur(28px)',
      borderRadius:20, border:'1px solid rgba(255,255,255,.09)',
      padding:'10px 14px 12px',
      display:'flex', alignItems:'center', gap:12,
      boxShadow:`0 -4px 32px rgba(0,0,0,.6), 0 8px 32px rgba(0,0,0,.5), 0 0 0 1px ${podcast.accent}22`,
      cursor:'pointer', zIndex:90,
    }}>
      {/* Progress bar at bottom */}
      <div style={{ position:'absolute', bottom:0, left:14, right:14, height:2, background:'rgba(255,255,255,.08)', borderRadius:99 }}>
        <div style={{ width:'27%', height:'100%', background:podcast.accent, borderRadius:99 }}/>
      </div>

      <div style={{ width:44, height:44, borderRadius:13, overflow:'hidden', flexShrink:0 }}>
        <img src={podcast.hostPhoto} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
      </div>

      <div style={{ flex:1, overflow:'hidden' }}>
        <div style={{ fontSize:13.5, fontWeight:700, color:'#fff', fontFamily:"'Syne',sans-serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {episode.title}
        </div>
        <div style={{ fontSize:11.5, color:'rgba(255,255,255,.42)', fontFamily:"'DM Sans',sans-serif", marginTop:1 }}>
          {podcast.host}
        </div>
      </div>

      {/* Waveform */}
      <div style={{ flexShrink:0 }}>
        <MiniWave playing={playing} accent={podcast.accent} bars={12}/>
      </div>

      {/* Play/Pause */}
      <button onClick={e => { e.stopPropagation(); onToggle(); }} style={{
        width:42, height:42, borderRadius:21, flexShrink:0,
        background:podcast.accent, border:'none', cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:`0 4px 16px ${podcast.accent}66`,
        transition:'transform .15s',
      }}
        onMouseEnter={e => e.currentTarget.style.transform='scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
      >
        {playing ? <PauseFill s={16}/> : <PlayFill s={16}/>}
      </button>
    </div>
  );
}
