import PodcastCard from './PodcastCard.jsx';
import { PODCASTS } from '../data/podcasts.js';

export default function Row({ section, onTap, onAdd }) {
  const podcasts = section.ids.map(id => PODCASTS.find(p => p.id === id)).filter(Boolean);
  if (!podcasts.length) return null;
  return (
    <div style={{ marginBottom:32 }}>
      <div style={{ padding:'0 20px 14px' }}>
        <span style={{ fontSize:17, fontWeight:800, color:'#fff', fontFamily:"'Syne',sans-serif", letterSpacing:'-.01em' }}>
          {section.title}
        </span>
      </div>
      <div style={{
        display:'flex', gap:15, overflowX:'auto',
        padding:'0 20px 4px', scrollbarWidth:'none',
      }}>
        {podcasts.map(p => (
          <PodcastCard key={p.id} podcast={p} onTap={onTap} onAdd={onAdd} />
        ))}
      </div>
    </div>
  );
}
