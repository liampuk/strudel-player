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

const song = `
// @title dash on the train @by todepond

$: note("[C G], <D Fb B C A>*[0.5,2]")
  // .rev()
  .sound("sawtooth").cpm(30).gain(.4)
.lpf("<100 200 300 400 500 600 700 800 900 1000 1100 1200 1300 1400 1300 1200 1100 1000 900 800 700 600 500 400 300 200>/4")
  .room(1)
  // .jux(pan)
  .pan("<0 1>/2")  
.delay(1)
.roomsize("10")
// .slow("1, .5, .25") // swap to this

  // $: note("F")
  //   .sound("piano").cpm(30)
  //  .lpf(800)

  
.slow(".1275").gain(.8)

// @version 1.1
`;

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

  const handlePlay = async () => {
    await evaluate(birdsOfAFeather);
    setPlaying(true);
  };

  const handleStop = () => {
    hush();
    setPlaying(false);
    setElapsed(0);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setElapsed(value);
    seekTo(value);
  };

  const handleScrubStart = () => setScrubbing(true);

  const handleScrubEnd = () => setScrubbing(false);

  return (
    <div className="flex flex-col gap-3 p-4 max-w-md">
      <div className="flex gap-2">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer disabled:opacity-50"
          disabled={!ready || playing}
          onClick={handlePlay}
        >
          Play
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-md cursor-pointer disabled:opacity-50"
          disabled={!ready || !playing}
          onClick={handleStop}
        >
          Stop
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-mono w-10 text-right">
          {formatTime(elapsed)}
        </span>
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
          className="flex-1 accent-blue-500"
        />
        <span className="text-sm font-mono w-10">
          {formatTime(DURATION_SECONDS)}
        </span>
      </div>
    </div>
  );
}
