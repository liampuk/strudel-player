import { useEffect, useRef, useState } from 'react';
import { usePlayback } from '../context/PlaybackContext';
import {
  getShareUrlForCode,
  getShareUrlForTrackId,
  getStrudelCcUrlForCode,
} from '../utils/urlUtils';
import type { Track } from '../types/track';
import Modal from './Modal';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const DRAG_THRESHOLD_RATIO = 0.25; // Collapse when dragged down past 25% of height

interface PlayerProps {
  tracks: Track[];
}

export default function Player({ tracks }: PlayerProps) {
  const {
    currentTrack,
    playing,
    elapsed,
    ready,
    repeat,
    toggleRepeat,
    shuffle,
    toggleShuffle,
    playTrack,
    pushToHistory,
    popFromHistory,
    pause,
    seekTo,
    DURATION_SECONDS,
    playerExpanded,
    setPlayerExpanded,
  } = usePlayback();
  const collapsed = !playerExpanded;
  const [dragY, setDragY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);
  const containerRef = useRef<HTMLDivElement>(null);
  const fullPlayerRef = useRef<HTMLDivElement>(null);
  const dragStartYRef = useRef(0);
  const dragYRef = useRef(0);
  const dragActiveRef = useRef(false);

  const handlePlayPause = async () => {
    if (playing) {
      pause();
    } else if (currentTrack) {
      await playTrack(currentTrack);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    seekTo(value);
  };

  const getRandomTrack = (exclude?: Track | null) => {
    const pool = exclude ? tracks.filter((t) => t.id !== exclude.id) : tracks;
    if (pool.length === 0) return exclude ?? null;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handlePrevious = () => {
    if (tracks.length === 0) return;
    if (shuffle) {
      const prevTrack = popFromHistory();
      const trackToPlay = prevTrack ?? getRandomTrack(currentTrack);
      if (trackToPlay) {
        playTrack(trackToPlay, { fromPrevious: true });
      }
    } else {
      const idx = currentTrack
        ? tracks.findIndex((t) => t.id === currentTrack.id)
        : -1;
      const prevIdx = idx <= 0 ? tracks.length - 1 : idx - 1;
      playTrack(tracks[prevIdx]);
    }
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    if (shuffle) {
      if (currentTrack) {
        pushToHistory(currentTrack);
      }
      const trackToPlay = getRandomTrack(currentTrack);
      if (trackToPlay) {
        playTrack(trackToPlay);
      }
    } else {
      const idx = currentTrack
        ? tracks.findIndex((t) => t.id === currentTrack.id)
        : -1;
      const nextIdx = idx < 0 || idx >= tracks.length - 1 ? 0 : idx + 1;
      playTrack(tracks[nextIdx]);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (collapsed) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-drag-ignore]')) return;
    if (target.closest('button, a, input, [role="button"]')) return;
    fullPlayerRef.current?.setPointerCapture(e.pointerId);
    dragActiveRef.current = true;
    dragStartYRef.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragActiveRef.current || collapsed) return;
    if (e.pointerType === 'mouse' && !e.buttons) return; // Mouse: only when button held
    const deltaY = e.clientY - dragStartYRef.current;
    if (deltaY <= 0) return; // Only allow dragging down
    const containerHeight = containerRef.current?.offsetHeight ?? 400;
    const maxDrag = containerHeight * 0.9; // Cap drag distance
    const newDragY = Math.min(deltaY, maxDrag);
    dragYRef.current = newDragY;
    setDragY(newDragY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    fullPlayerRef.current?.releasePointerCapture?.(e.pointerId);
    const wasDragging = dragActiveRef.current;
    dragActiveRef.current = false;
    if (!wasDragging || collapsed) return;
    const containerHeight = containerRef.current?.offsetHeight ?? 400;
    const threshold = containerHeight * DRAG_THRESHOLD_RATIO;
    const currentDragY = dragYRef.current;
    if (currentDragY > threshold) {
      setPlayerExpanded(false);
    }
    setDragY(0);
    dragYRef.current = 0;
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    fullPlayerRef.current?.releasePointerCapture?.(e.pointerId);
    dragActiveRef.current = false;
    setDragY(0);
    dragYRef.current = 0;
  };

  const progressPercent = (elapsed / DURATION_SECONDS) * 100;
  const remainingSeconds = Math.max(0, DURATION_SECONDS - elapsed);

  const albumArtUrl = currentTrack?.albumArt;

  const isDragging = dragY > 0;
  const fullPlayerTransform = collapsed
    ? 'translateY(100%)'
    : isDragging
    ? `translateY(${dragY}px)`
    : 'translateY(0)';

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-0 overflow-hidden md:max-h-[800px]"
    >
      {/* Full player - slides down when collapsed, draggable */}
      <div
        ref={fullPlayerRef}
        className={`pointer-events-auto flex flex-col h-full min-h-0 overflow-hidden bg-[#121212] text-white ${
          collapsed ? '' : 'shadow-[0_-8px_16px_rgba(0,0,0,0.3)]'
        }`}
        style={{
          transform: fullPlayerTransform,
          transition: isDragging ? 'none' : 'transform 300ms ease-out',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-[#121212] shrink-0">
          <button
            type="button"
            className="p-2 -ml-2 text-white/90 hover:text-white -rotate-90 cursor-pointer"
            aria-label="Back"
            onClick={() => setPlayerExpanded(false)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <h1 className="text-base font-semibold select-none">Now Playing</h1>
          <div className="relative -mr-2" ref={menuRef}>
            <button
              type="button"
              className="p-2 text-white/90 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="More options"
              aria-expanded={menuOpen}
              aria-haspopup="true"
              disabled={!currentTrack}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
            {menuOpen && currentTrack && (
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
                    const url = currentTrack.userAdded
                      ? getShareUrlForCode(currentTrack.code)
                      : getShareUrlForTrackId(currentTrack.id);
                    void navigator.clipboard.writeText(url);
                    setMenuOpen(false);
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
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <section className="flex flex-col flex-1 min-h-0 overflow-hidden px-6 pt-4 pb-2">
          {/* Album art placeholder */}
          <img
            src={albumArtUrl}
            alt="Album art"
            className="w-full aspect-square max-w-[280px] mx-auto rounded-lg object-cover pointer-events-none select-none md:w-[min(280px,28vh)] md:h-[min(280px,28vh)] md:aspect-auto"
          />

          {/* Song info */}
          <div className="flex items-start gap-3 mt-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">
                {currentTrack?.title ?? '—'}
              </h2>
              <p className="text-sm text-white/60 truncate mt-0.5">
                <a
                  href={currentTrack?.artistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white pointer-events-auto"
                >
                  {currentTrack?.artist ?? '—'}
                </a>
              </p>
            </div>
            <div
              className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer ${
                currentTrack?.userAdded ? 'bg-white/30' : 'bg-[#1DB954]'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                {currentTrack?.userAdded ? (
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                ) : (
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                )}
              </svg>
            </div>
          </div>

          {/* Progress bar - excluded from drag to allow scrubbing */}
          <div
            className="mt-6 space-y-1"
            data-drag-ignore
            style={{ touchAction: 'pan-x' }}
          >
            <input
              type="range"
              min={0}
              max={DURATION_SECONDS}
              step={0.1}
              value={elapsed}
              disabled={!ready}
              onChange={handleScrub}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/30 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
              style={{
                background: `linear-gradient(to right, white ${progressPercent}%, rgba(255,255,255,0.3) ${progressPercent}%)`,
              }}
            />
            <div className="flex justify-between text-xs text-white/60">
              <span>{formatTime(elapsed)}</span>
              <span>-{formatTime(remainingSeconds)}</span>
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              type="button"
              className={`p-2 ${
                shuffle
                  ? 'text-[#1DB954] hover:text-[#1ed760]'
                  : 'text-white/70 hover:text-white'
              }`}
              aria-label="Shuffle"
              aria-pressed={shuffle}
              onClick={toggleShuffle}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
              </svg>
            </button>
            <button
              type="button"
              className="text-white/70 hover:text-white p-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-white/70"
              aria-label="Previous"
              onClick={handlePrevious}
              disabled={!ready || tracks.length === 0}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handlePlayPause}
              disabled={!ready}
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#121212] hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              className="text-white/70 hover:text-white p-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-white/70"
              aria-label="Next"
              onClick={handleNext}
              disabled={!ready || tracks.length === 0}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
            <button
              type="button"
              className={`p-2 ${
                repeat
                  ? 'text-[#1DB954] hover:text-[#1ed760]'
                  : 'text-white/70 hover:text-white'
              }`}
              aria-label="Repeat"
              aria-pressed={repeat}
              onClick={toggleRepeat}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
              </svg>
            </button>
          </div>

          {/* Device & sharing */}
          <div className="flex items-center justify-between mt-8 text-sm">
            <button
              type="button"
              disabled={!currentTrack}
              onClick={() => setCodeModalOpen(true)}
              className="flex items-center gap-2 text-[#1DB954] hover:text-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-[#1DB954] cursor-pointer"
              aria-label="View code"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
              </svg>
              <span>View code</span>
            </button>
            <div className="flex items-center gap-4 text-white/70">
              <button
                type="button"
                aria-label="Share"
                disabled={!currentTrack}
                className="disabled:opacity-50 disabled:cursor-not-allowed hover:text-white active:text-green-500 transition-colors cursor-pointer"
                onClick={() => {
                  if (currentTrack) {
                    const url = currentTrack.userAdded
                      ? getShareUrlForCode(currentTrack.code)
                      : getShareUrlForTrackId(currentTrack.id);
                    void navigator.clipboard.writeText(url);
                  }
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-4 bg-[#181818] border-t border-white/5">
          <h3 className="text-sm font-semibold text-white/90">
            About this project
          </h3>
          <p className="text-xs text-white/60 mt-1 line-clamp-2">
            Streaming app for{' '}
            <a
              className="text-white/80 font-semibold hover:text-white"
              href="https://strudel.tidalcycles.org"
            >
              Strudel
            </a>{' '}
            - a pattern language for writing music. Built by{' '}
            <a
              className="text-white/80 font-semibold hover:text-white"
              href="https://liamp.uk"
            >
              Liam
            </a>
            .
          </p>
        </footer>

        <Modal
          key={codeModalOpen ? 'open' : 'closed'}
          isOpen={codeModalOpen}
          onClose={() => setCodeModalOpen(false)}
          title={currentTrack ? `${currentTrack.title} – Code` : 'View code'}
          ariaLabel="View Strudel code"
        >
          {currentTrack ? (
            <>
              <pre className="p-4 rounded-lg bg-[#0d0d0d] text-sm text-white/90 overflow-x-auto font-mono whitespace-pre-wrap wrap-break-word">
                <code>{currentTrack.code}</code>
              </pre>
              <a
                href={getStrudelCcUrlForCode(currentTrack.code)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#1DB954] text-white font-medium hover:bg-[#1ed760] transition-colors"
              >
                View on strudel.cc
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                </svg>
              </a>
            </>
          ) : (
            <p className="text-white/60">No track selected.</p>
          )}
        </Modal>
      </div>

      {/* Now playing bar - slides up when collapsed or dragging, click to expand. Hidden when no track. */}
      {currentTrack && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setPlayerExpanded(true)}
          onKeyDown={(e) => e.key === 'Enter' && setPlayerExpanded(true)}
          className="pointer-events-auto absolute bottom-0 left-0 right-0 z-10 flex items-center gap-3 px-4 py-3 bg-[#181a2b] rounded-t-lg cursor-default text-left"
          style={{
            transform: collapsed
              ? 'translateY(0)'
              : isDragging
              ? `translateY(max(0px, calc(100% - ${dragY}px)))`
              : 'translateY(100%)',
            transition: isDragging ? 'none' : 'transform 300ms ease-out',
          }}
          aria-label="Expand player"
        >
          <img
            src={albumArtUrl}
            alt=""
            className="w-12 h-12 rounded-lg object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {currentTrack ? (
                <>
                  {currentTrack.title}{' '}
                  <span className="text-white/50 font-normal">•</span>{' '}
                  <span className="text-white/70 font-normal">
                    {currentTrack.artist}
                  </span>
                </>
              ) : (
                '—'
              )}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5 text-[#1DB954]">
              {playing && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}

              <span className="text-xs font-medium truncate">
                Currently playing
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              className="p-1 text-white hover:text-white/90 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
