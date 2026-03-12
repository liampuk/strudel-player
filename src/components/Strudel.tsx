import { useEffect, useRef, useState } from "react";
import { initStrudel, evaluate, hush } from "./strudelEngine.ts";

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

export default function Strudel() {
  const initRef = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    initStrudel().then(() => setReady(true));
  }, []);

  return (
    <div className="flex gap-2 p-4">
      <button
        className="bg-blue-500 text-white p-2 rounded-md cursor-pointer disabled:opacity-50"
        disabled={!ready}
        onClick={() => evaluate(song)}
      >
        Play
      </button>
      <button
        className="bg-red-500 text-white p-2 rounded-md cursor-pointer disabled:opacity-50"
        disabled={!ready}
        onClick={() => hush()}
      >
        Stop
      </button>
    </div>
  );
}
