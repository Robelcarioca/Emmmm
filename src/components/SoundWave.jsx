import { useState, useEffect } from 'react';

function useTick(ms = 40) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT(p => p + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return t;
}

// Full 40-bar waveform for player screen
export function SoundWave({ playing, accent = '#4f46e5', bars = 40, maxH = 44 }) {
  const tick = useTick(36);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:2.5, height:maxH+4, justifyContent:'center' }}>
      {Array.from({length:bars}).map((_,i) => {
        const h = playing
          ? 4 + Math.abs(Math.sin(tick * 0.06 + i * 0.38)) * maxH
          : 3;
        return (
          <div key={i} style={{
            width: 3, height: h, borderRadius: 99,
            background: `linear-gradient(to top, ${accent}, ${accent}77)`,
            transition: playing ? 'none' : 'height .55s ease',
            opacity: 0.5 + 0.5 * Math.abs(Math.sin(i * 0.48)),
          }}/>
        );
      })}
    </div>
  );
}

// Compact waveform for mini player / cards
export function MiniWave({ playing, accent = '#4f46e5', bars = 16 }) {
  const tick = useTick(48);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:1.5, height:20 }}>
      {Array.from({length:bars}).map((_,i) => {
        const h = playing ? 2 + Math.abs(Math.sin(tick * 0.08 + i * 0.52)) * 14 : 2;
        return <div key={i} style={{ width:2.5, height:h, borderRadius:99, background:accent, transition: playing ? 'none' : 'height .5s' }}/>;
      })}
    </div>
  );
}
