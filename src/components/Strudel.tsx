import { useEffect, useRef, useState } from 'react';
import {
  initStrudel,
  evaluate,
  hush,
  isPlaying,
  getElapsedSeconds,
  seekTo,
  checkDurationLimit,
  DURATION_SECONDS,
} from './strudelEngine.ts';
import birdsOfAFeather from '../assets/birdsOfAFeather.strudel?raw';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Strudel() {
  const initRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const rafRef = useRef<number>(0);
  const scrubbingRef = useRef(false);

  useEffect(() => {
    scrubbingRef.current = scrubbing;
  }, [scrubbing]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    initStrudel().then(() => setReady(true));
  }, []);

  useEffect(() => {
    const tick = () => {
      if (checkDurationLimit()) {
        setPlaying(false);
        setElapsed(DURATION_SECONDS);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (!scrubbingRef.current) {
        setElapsed(getElapsedSeconds());
      }
      setPlaying(isPlaying());
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handlePlayPause = async () => {
    if (playing) {
      hush();
      setPlaying(false);
      setElapsed(0);
    } else {
      await evaluate(birdsOfAFeather);
      setPlaying(true);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setElapsed(value);
    seekTo(value);
  };

  const handleScrubStart = () => setScrubbing(true);
  const handleScrubEnd = () => setScrubbing(false);

  const progressPercent = (elapsed / DURATION_SECONDS) * 100;
  const remainingSeconds = Math.max(0, DURATION_SECONDS - elapsed);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#121212] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#121212] shrink-0">
        <button
          type="button"
          className="p-2 -ml-2 text-white/90 hover:text-white"
          aria-label="Back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <h1 className="text-base font-semibold">Now Playing</h1>
        <button
          type="button"
          className="p-2 -mr-2 text-white/90 hover:text-white"
          aria-label="More options"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </header>

      {/* Main content */}
      <main className="flex flex-col flex-1 min-h-0 overflow-hidden px-6 pt-4 pb-2">
        {/* Album art placeholder */}
        <img
          src="https://upload.wikimedia.org/wikipedia/en/f/fe/Billie_Eilish_-_Birds_of_a_Feather_7%22_Vinyl_cover.png"
          alt="Album art"
          className="w-full aspect-square max-w-[280px] mx-auto rounded-xl object-cover shrink-0"
        />

        {/* Song info */}
        <div className="flex items-start gap-3 mt-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">Birds of a Feather</h2>
            <p className="text-sm text-white/60 truncate mt-0.5">saga_3k</p>
          </div>
          <div className="shrink-0 w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 space-y-1">
          <input
            type="range"
            min={0}
            max={DURATION_SECONDS}
            step={0.1}
            value={elapsed}
            disabled={!ready}
            onChange={handleScrub}
            onPointerDown={handleScrubStart}
            onPointerUp={handleScrubEnd}
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
            className="text-white/70 hover:text-white p-2"
            aria-label="Shuffle"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
          </button>
          <button
            type="button"
            className="text-white/70 hover:text-white p-2"
            aria-label="Previous"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handlePlayPause}
            disabled={!ready}
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#121212] hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
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
            className="text-white/70 hover:text-white p-2"
            aria-label="Next"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
          <button
            type="button"
            className="text-white/70 hover:text-white p-2"
            aria-label="Repeat"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
            </svg>
          </button>
        </div>

        {/* Device & sharing */}
        <div className="flex items-center justify-between mt-8 text-sm">
          <div className="flex items-center gap-2 text-[#1DB954]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
            </svg>
            <span>This device</span>
          </div>
          <div className="flex items-center gap-4 text-white/70">
            <button type="button" aria-label="Share">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" />
              </svg>
            </button>
            <button type="button" aria-label="Queue">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M4 6h2v12H4zm4 0h2v12H8zm4 0h2v12h-2zm4 0h2v12h-2z" />
              </svg>
            </button>
          </div>
        </div>
      </main>

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
          - a pattern language for writing music. More coming soon.
        </p>
      </footer>
    </div>
  );
}
