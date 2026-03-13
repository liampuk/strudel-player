import { useState, useMemo } from 'react';
import { usePlayback } from '../context/PlaybackContext';
import type { Track } from '../types/track';

interface PlaylistProps {
  tracks: Track[];
}

function TrackRow({
  track,
  isActive,
  isPlaying,
  onSelect,
}: {
  track: Track;
  isActive: boolean;
  isPlaying: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-white/5 transition-colors"
    >
      <img
        src={track.albumArt}
        alt=""
        className="w-12 h-12 rounded shrink-0 object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="flex gap-2 min-w-0 items-center">
          {isActive && (
            <div className="flex items-end gap-0.5 shrink-0 h-3" aria-hidden>
              <span
                className="w-0.5 h-3 bg-[#1DB954] rounded-full origin-bottom block"
                style={
                  isPlaying
                    ? { animation: 'eq-bounce 0.5s ease-in-out infinite' }
                    : { transform: 'scaleY(0.4)' }
                }
              />
              <span
                className="w-0.5 h-3 bg-[#1DB954] rounded-full origin-bottom block"
                style={
                  isPlaying
                    ? { animation: 'eq-bounce 0.5s ease-in-out infinite 0.15s' }
                    : { transform: 'scaleY(0.4)' }
                }
              />
              <span
                className="w-0.5 h-3 bg-[#1DB954] rounded-full origin-bottom block"
                style={
                  isPlaying
                    ? { animation: 'eq-bounce 0.5s ease-in-out infinite 0.3s' }
                    : { transform: 'scaleY(0.4)' }
                }
              />
            </div>
          )}
          <p
            className={`truncate font-medium flex-1 min-w-0 ${
              isActive ? 'text-[#1DB954]' : 'text-white/90'
            }`}
          >
            {track.title}
          </p>
        </div>
        <p className="truncate text-sm text-white/60">{track.artist}</p>
      </div>
      <button
        type="button"
        className="p-2 text-white/60 hover:text-white shrink-0"
        aria-label="More options"
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>
    </button>
  );
}

export default function Playlist({ tracks }: PlaylistProps) {
  const { currentTrack, playing, playTrack, pause, ready } = usePlayback();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTracks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    );
  }, [tracks, searchQuery]);

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    if (playing) {
      pause();
    } else {
      const track = currentTrack ?? tracks[0];
      playTrack(track);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#121212] text-white">
      {/* Header */}
      <header className="shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="p-2 -ml-2 text-white/90 hover:text-white"
            aria-label="Info"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </button>
          <div className="relative z-10 flex-1 min-w-0">
            <input
              type="search"
              name="search"
              placeholder="Find song"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-white/10 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 cursor-text"
            />
          </div>
        </div>
      </header>

      {/* Playlist info with play button */}
      <div className="flex items-center gap-4 px-4 py-4 shrink-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">Strudel Songs</h1>
          <p className="text-sm text-white/60 mt-0.5">
            Browse the current list of tracks. Have a song you'd like to add?
            Submit it{' '}
            <a
              className="text-white/80 font-semibold hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/liampuk/strudel-player"
            >
              here
            </a>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={handlePlayAll}
          disabled={!ready || tracks.length === 0}
          className="w-14 h-14 shrink-0 rounded-full bg-[#1DB954] flex items-center justify-center text-[#121212] hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Song list */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filteredTracks.map((track) => (
          <TrackRow
            key={track.id}
            track={track}
            isActive={currentTrack?.id === track.id}
            isPlaying={playing && currentTrack?.id === track.id}
            onSelect={() => playTrack(track)}
          />
        ))}
      </div>
    </div>
  );
}
