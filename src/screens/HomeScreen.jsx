import HeroCarousel from '../components/HeroCarousel.jsx';
import NewUpdatedSection from '../components/NewUpdatedSection.jsx';
import Row from '../components/Row.jsx';
import { SECTIONS } from '../data/podcasts.js';

export default function HomeScreen({ onPodcastTap, onAddToCollection }) {
  return (
    <div style={{ paddingBottom:120 }}>
      {/* ── Cinematic Hero ── */}
      <HeroCarousel onPodcastTap={onPodcastTap} onAdd={onAddToCollection} />

      {/* ── New & Updated ── */}
      <div style={{ padding:'28px 0 0' }}>
        <NewUpdatedSection onPodcastTap={onPodcastTap} />
      </div>

      {/* ── Spotify-style rows ── */}
      {SECTIONS.map(sec => (
        <Row key={sec.title} section={sec} onTap={onPodcastTap} onAdd={onAddToCollection} />
      ))}
    </div>
  );
}
