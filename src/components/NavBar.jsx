import { HomeIcon, SearchIcon, LibIcon, UserIcon } from './Icons.jsx';

export default function NavBar({ active, onChange }) {
  const tabs = [
    { id:'home',    label:'Home',    Icon:HomeIcon },
    { id:'search',  label:'Search',  Icon:SearchIcon },
    { id:'library', label:'Library', Icon:LibIcon },
    { id:'profile', label:'Profile', Icon:UserIcon },
  ];
  return (
    <nav style={{
      position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)',
      width:'100%', maxWidth:430,
      background:'rgba(6,6,10,.97)', backdropFilter:'blur(24px)',
      borderTop:'1px solid rgba(255,255,255,.06)',
      display:'flex', padding:'8px 0 max(20px,env(safe-area-inset-bottom))',
      zIndex:100,
    }}>
      {tabs.map(({ id, label, Icon }) => {
        const on = active === id;
        return (
          <button key={id} onClick={() => onChange(id)} style={{
            flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4,
            background:'none', border:'none', cursor:'pointer',
            transform: on ? 'translateY(-1px)' : 'none',
            transition:'transform .2s',
          }}>
            <div style={{
              width:44, height:44, borderRadius:14,
              display:'flex', alignItems:'center', justifyContent:'center',
              background: on ? 'rgba(79,70,229,.2)' : 'transparent',
              boxShadow: on ? '0 0 18px rgba(79,70,229,.4)' : 'none',
              transition:'all .3s',
            }}>
              <Icon s={20} c={on ? '#818cf8' : 'rgba(255,255,255,.28)'} />
            </div>
            <span style={{
              fontSize:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600,
              color: on ? '#818cf8' : 'rgba(255,255,255,.28)',
              letterSpacing:'.03em',
            }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
