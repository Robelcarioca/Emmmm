import { useState, useCallback } from 'react';
import { PODCASTS, getMockEpisodes } from './data/podcasts.js';
import usePodcastPlayer, { loadEpisodes } from './hooks/usePodcastPlayer.js';

import NavBar               from './components/NavBar.jsx';
import MiniPlayer           from './components/MiniPlayer.jsx';
import PlayerScreen         from './components/PlayerScreen.jsx';
import AddToCollectionModal from './components/AddToCollectionModal.jsx';

import HomeScreen    from './screens/HomeScreen.jsx';
import SearchScreen  from './screens/SearchScreen.jsx';
import LibraryScreen, { CollectionDetail } from './screens/LibraryScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import DetailScreen  from './screens/DetailScreen.jsx';

export default function App() {
  // ── Navigation ────────────────────────────────────────────────────────────
  const [tab,                setTab]                = useState('home');
  const [selectedPodcast,    setSelectedPodcast]    = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [playerOpen,         setPlayerOpen]         = useState(false);

  // ── Playback state ────────────────────────────────────────────────────────
  const [currentPodcast,  setCurrentPodcast]  = useState(null);
  const [currentEpisode,  setCurrentEpisode]  = useState(null);
  const [playerMode,      setPlayerMode]      = useState('idle');
  // playerMode: 'idle' | 'loading' | 'rss' | 'youtube' | 'error'
  const [youtubeVideoId,  setYoutubeVideoId]  = useState(null);
  const [rssLoading,      setRssLoading]      = useState(false);

  const rssPlayer = usePodcastPlayer();

  // ── Collections ───────────────────────────────────────────────────────────
  const [collections, setCollections] = useState([
    { id:1, name:'My Favourites',   podcasts:[PODCASTS[0], PODCASTS[4]] },
    { id:2, name:'Morning Mindset', podcasts:[PODCASTS[1], PODCASTS[2]] },
  ]);
  const [addTarget, setAddTarget] = useState(null);

  const createCollection = (name, podcast = null) =>
    setCollections(prev => [...prev, { id:Date.now(), name, podcasts: podcast ? [podcast] : [] }]);

  const addToCollection = (colId, podcast) =>
    setCollections(prev => prev.map(c =>
      c.id === colId && !c.podcasts.find(p => p.id === podcast.id)
        ? { ...c, podcasts:[...c.podcasts, podcast] } : c
    ));

  const removeFromCollection = (colId, podcastId) => {
    setCollections(prev => prev.map(c =>
      c.id === colId ? { ...c, podcasts: c.podcasts.filter(p => p.id !== podcastId) } : c
    ));
    setSelectedCollection(prev =>
      prev ? { ...prev, podcasts: prev.podcasts.filter(p => p.id !== podcastId) } : prev
    );
  };

  // ── PLAY HANDLER ─────────────────────────────────────────────────────────
  // Strategy:
  //   1. Open player immediately so user sees feedback
  //   2. If podcast has rssFeed → try fetching real MP3 from RSS
  //   3. If RSS fails or no rssFeed → embed YouTube IFrame (real audio/video)
  //   4. Never leave the player empty / broken
  const handlePlay = useCallback(async (podcast, episode) => {
    setCurrentPodcast(podcast);
    setPlayerOpen(true);

    // If episode already has a resolved MP3 url, play it directly
    if (episode?.audioUrl) {
      setCurrentEpisode(episode);
      setPlayerMode('rss');
      rssPlayer.loadAudio(episode.audioUrl, podcast.id);
      return;
    }

    const placeholder = episode || getMockEpisodes(podcast)[0];
    setCurrentEpisode(placeholder);

    // Try RSS first if available
    if (podcast.rssFeed) {
      setPlayerMode('loading');
      setRssLoading(true);
      try {
        const episodes = await loadEpisodes(podcast);
        if (episodes.length > 0) {
          const ep = episodes[0];
          setCurrentEpisode(prev => ({ ...prev, ...ep }));
          setPlayerMode('rss');
          setRssLoading(false);
          rssPlayer.loadAudio(ep.audioUrl, podcast.id);
          return;
        }
      } catch (_) {}
      setRssLoading(false);
    }

    // Fall back to YouTube — real audio via official YouTube embed
    if (podcast.youtubeId) {
      setPlayerMode('youtube');
      setYoutubeVideoId(podcast.youtubeId);
    } else {
      setPlayerMode('error');
    }
  }, [rssPlayer]);

  const handleTabChange = (t) => {
    setTab(t);
    setSelectedPodcast(null);
    setSelectedCollection(null);
  };

  const renderMain = () => {
    if (selectedCollection) return (
      <CollectionDetail
        collection={selectedCollection}
        onBack={() => setSelectedCollection(null)}
        onPodcastTap={p => setSelectedPodcast(p)}
        onRemove={removeFromCollection}
      />
    );

    if (selectedPodcast) return (
      <DetailScreen
        podcast={selectedPodcast}
        onBack={() => setSelectedPodcast(null)}
        onPlay={handlePlay}
        onAddToCollection={p => setAddTarget(p)}
        collections={collections}
      />
    );

    switch (tab) {
      case 'home':
        return <HomeScreen
          onPodcastTap={p => setSelectedPodcast(p)}
          onAddToCollection={p => setAddTarget(p)}
        />;
      case 'search':
        return <SearchScreen
          onPodcastTap={p => setSelectedPodcast(p)}
          onAdd={p => setAddTarget(p)}
        />;
      case 'library':
        return <LibraryScreen
          collections={collections}
          onCollectionTap={col => setSelectedCollection(col)}
          onCreateCollection={createCollection}
        />;
      case 'profile':
        return <ProfileScreen collections={collections} />;
      default:
        return null;
    }
  };

  const navActive = (selectedPodcast || selectedCollection) ? '' : tab;

  // Derive playing state for mini player (rss or youtube)
  const isPlaying = playerMode === 'rss' ? rssPlayer.playing : false;

  return (
    <div style={{
      minHeight: '100vh', background: '#040408',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 0',
    }}>
      {/* ── Phone shell ─────────────────────────────────────────────────── */}
      <div style={{
        width: 430, minHeight: 932, position: 'relative',
        background: '#08080C', borderRadius: 52, overflow: 'hidden',
        boxShadow: '0 40px 130px rgba(0,0,0,.95), 0 0 0 1px rgba(255,255,255,.06)',
      }}>
        {/* Status bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '15px 28px 0', display: 'flex', justifyContent: 'space-between',
          zIndex: 155, pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', fontFamily: "'Syne',sans-serif" }}>9:41</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontFamily: "'DM Sans',sans-serif" }}>●●●  WiFi  ⚡100%</span>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', minHeight: 932, scrollbarWidth: 'none' }}>
          {renderMain()}
        </div>

        {/* Mini Player */}
        {currentPodcast && !playerOpen && (
          <MiniPlayer
            podcast={currentPodcast}
            episode={currentEpisode}
            playing={isPlaying}
            progress={rssPlayer.progress}
            onToggle={rssPlayer.togglePlay}
            onExpand={() => setPlayerOpen(true)}
          />
        )}

        {/* Bottom Nav */}
        {!playerOpen && <NavBar active={navActive} onChange={handleTabChange} />}

        {/* Full Screen Player */}
        {playerOpen && currentPodcast && (
          <PlayerScreen
            podcast={currentPodcast}
            episode={currentEpisode}
            playerMode={playerMode}
            rssPlayer={{ ...rssPlayer, rssLoading }}
            youtubeVideoId={youtubeVideoId}
            onClose={() => setPlayerOpen(false)}
            onOpenAddModal={p => setAddTarget(p)}
          />
        )}

        {/* Add to Collection modal */}
        {addTarget && (
          <AddToCollectionModal
            podcast={addTarget}
            collections={collections}
            onAdd={addToCollection}
            onCreate={createCollection}
            onClose={() => setAddTarget(null)}
          />
        )}
      </div>
    </div>
  );
}
