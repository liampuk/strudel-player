import { PlaybackProvider } from './context/PlaybackContext';
import Player from './components/Player';
import Playlist from './components/Playlist';
import { tracks } from './data/tracks';

function App() {
  return (
    <PlaybackProvider tracks={tracks}>
      <div className="h-full min-h-0 bg-[#090909] flex justify-center items-center overflow-hidden">
        <div className="relative w-full max-w-[430px] h-full min-h-0 flex flex-col shadow-2xl overflow-hidden md:max-h-[800px] bg-[#121212]">
          <div className="flex-1 min-h-0 overflow-hidden pb-20">
            <Playlist tracks={tracks} />
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[min(800px,100dvh)] md:h-[min(800px,85vh)] z-100">
            <Player tracks={tracks} />
          </div>
        </div>
      </div>
    </PlaybackProvider>
  );
}

export default App;
