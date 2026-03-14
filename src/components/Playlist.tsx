import { useState, useMemo, useRef, useEffect } from 'react';
import { usePlayback } from '../context/PlaybackContext';
import { getShareUrlForCode, getShareUrlForTrackId } from '../utils/urlUtils';
import type { Track } from '../types/track';

interface PlaylistProps {
  tracks: Track[];
  onOpenInfo: () => void;
  onOpenAddSongs: () => void;
  onDeleteTrack: (track: Track) => void;
}

function TrackRow({
  track,
  isActive,
  isPlaying,
  onSelect,
  menuOpen,
  onOpenMenu,
  onShare,
  onDelete,
}: {
  track: Track;
  isActive: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  menuOpen: boolean;
  onOpenMenu: (trackId: string | null) => void;
  onShare: () => void;
  onDelete: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, onOpenMenu]);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-white/5 transition-colors cursor-pointer"
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
        <div className="flex items-center gap-1.5 min-w-0">
          {track.userAdded && (
            <span
              className="shrink-0 w-3 h-3 rounded-full bg-[#1DB954] flex items-center justify-center text-[#121212]"
              aria-hidden
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </span>
          )}
          <p className="truncate text-sm text-white/60">{track.artist}</p>
        </div>
      </div>
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          className="p-2 text-white/60 hover:text-white shrink-0"
          aria-label="More options"
          aria-expanded={menuOpen}
          aria-haspopup="true"
          onClick={(e) => {
            e.stopPropagation();
            onOpenMenu(menuOpen ? null : track.id);
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
        {menuOpen && (
          <div
            className="absolute right-0 top-full mt-1 py-1 min-w-[140px] rounded-lg bg-[#282828] shadow-lg border border-white/10 z-50"
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-3"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
                onOpenMenu(null);
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" />
              </svg>
              Share
            </button>
            <button
              type="button"
              role="menuitem"
              disabled={!track.userAdded}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 ${
                track.userAdded
                  ? 'text-white hover:bg-white/10'
                  : 'text-white/40 cursor-not-allowed'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (track.userAdded) {
                  onDelete();
                  onOpenMenu(null);
                }
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Playlist({
  tracks,
  onOpenInfo,
  onOpenAddSongs,
  onDeleteTrack,
}: PlaylistProps) {
  const { currentTrack, playing, playTrack, pause, ready } = usePlayback();
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuTrackId, setOpenMenuTrackId] = useState<string | null>(null);

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
      playTrack(track, { expandPlayer: true });
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#121212] text-white">
      {/* Header */}
      <header className="shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="p-2 -ml-2 text-white/90 hover:text-white cursor-pointer"
            aria-label="Info"
            onClick={onOpenInfo}
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
            Browse the current list of tracks. Have a song you'd like to add for
            everyone? Submit it{' '}
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
        <div
          role="button"
          tabIndex={0}
          onClick={onOpenAddSongs}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenAddSongs();
            }
          }}
          className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="w-12 h-12 rounded shrink-0 bg-white/10 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-white/70"
            >
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate font-normal text-white/90">Add songs</p>
          </div>
        </div>
        {filteredTracks.map((track) => (
          <TrackRow
            key={track.id}
            track={track}
            isActive={currentTrack?.id === track.id}
            isPlaying={playing && currentTrack?.id === track.id}
            onSelect={() => playTrack(track, { expandPlayer: true })}
            menuOpen={openMenuTrackId === track.id}
            onOpenMenu={setOpenMenuTrackId}
            onShare={() => {
              const url = track.userAdded
                ? getShareUrlForCode(track.code)
                : getShareUrlForTrackId(track.id);
              void navigator.clipboard.writeText(url);
            }}
            onDelete={() => onDeleteTrack(track)}
          />
        ))}
      </div>
    </div>
  );
}
