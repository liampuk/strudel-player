import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  initStrudel,
  evaluate,
  hush,
  isPlaying,
  getElapsedSeconds,
  seekTo,
  checkDurationLimit,
  DURATION_SECONDS,
} from '../components/strudelEngine';
import type { Track } from '../types/track';

interface PlaybackContextValue {
  currentTrack: Track | null;
  playing: boolean;
  elapsed: number;
  ready: boolean;
  repeat: boolean;
  toggleRepeat: () => void;
  shuffle: boolean;
  toggleShuffle: () => void;
  playTrack: (track: Track, options?: { fromPrevious?: boolean }) => Promise<void>;
  pushToHistory: (track: Track) => void;
  popFromHistory: () => Track | null;
  pause: () => void;
  seekTo: (seconds: number) => void;
  DURATION_SECONDS: number;
}

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export function PlaybackProvider({
  children,
  tracks,
}: {
  children: ReactNode;
  tracks: Track[];
}) {
  const initRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(
    tracks.find((t) => t.id === 'dash-on-the-train') ?? tracks[0] ?? null
  );
  const [elapsed, setElapsed] = useState(0);
  const [repeat, setRepeat] = useState(true);
  const [shuffle, setShuffle] = useState(false);
  const historyRef = useRef<Track[]>([]);
  const rafRef = useRef<number>(0);
  const repeatRef = useRef(repeat);
  const currentTrackRef = useRef(currentTrack);
  const playTrackRef = useRef<
    (track: Track, options?: { fromPrevious?: boolean }) => Promise<void>
  >(() => Promise.resolve());
  const pauseRef = useRef(() => {});
  const playingRef = useRef(playing);

  repeatRef.current = repeat;
  currentTrackRef.current = currentTrack;
  playingRef.current = playing;

  const toggleRepeat = useCallback(() => {
    setRepeat((r) => !r);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((s) => !s);
  }, []);

  const pushToHistory = useCallback((track: Track) => {
    historyRef.current = [...historyRef.current, track];
  }, []);

  const popFromHistory = useCallback((): Track | null => {
    const h = historyRef.current;
    if (h.length === 0) return null;
    const popped = h[h.length - 1];
    historyRef.current = h.slice(0, -1);
    return popped;
  }, []);

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
        if (repeatRef.current && currentTrackRef.current) {
          void playTrackRef.current(currentTrackRef.current);
        }
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      setElapsed(getElapsedSeconds());
      setPlaying(isPlaying());
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const playTrack = useCallback(
    async (track: Track, options?: { fromPrevious?: boolean }) => {
      const isNewTrack = track !== currentTrack;
      if (
        isNewTrack &&
        shuffle &&
        !options?.fromPrevious &&
        currentTrack
      ) {
        pushToHistory(currentTrack);
      }
      setCurrentTrack(track);
      if (isNewTrack) {
        seekTo(0); // Reset position when switching tracks
      }
      hush();
      await evaluate(track.code);
      setPlaying(true);
    },
    [currentTrack, shuffle, pushToHistory]
  );

  playTrackRef.current = playTrack;

  const pause = useCallback(() => {
    seekTo(getElapsedSeconds()); // Save position before stopping
    hush();
    setPlaying(false);
  }, []);

  pauseRef.current = pause;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      if (playingRef.current) {
        pauseRef.current();
      } else if (currentTrackRef.current) {
        void playTrackRef.current(currentTrackRef.current);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSeekTo = useCallback((seconds: number) => {
    seekTo(seconds);
    setElapsed(seconds);
  }, []);

  const value: PlaybackContextValue = {
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
    seekTo: handleSeekTo,
    DURATION_SECONDS,
  };

  return (
    <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error('usePlayback must be used within PlaybackProvider');
  return ctx;
}
