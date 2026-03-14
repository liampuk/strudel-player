import { useState, useRef } from 'react';
import { PlaybackProvider } from './context/PlaybackContext';
import Player from './components/Player';
import Playlist from './components/Playlist';
import InfoModal from './components/InfoModal';
import AddSongsModal from './components/AddSongsModal';
import { tracks as defaultTracks } from './data/tracks';
import { getUserTracks, removeUserTrack } from './utils/userTracks';
import { getEncodedStrudelFromUrl } from './utils/urlUtils';

function App() {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const hasEncodedCodeOnLoad = !!getEncodedStrudelFromUrl();
  const [showAddSongsModal, setShowAddSongsModal] = useState(hasEncodedCodeOnLoad);
  const openedByUrlLoadRef = useRef(hasEncodedCodeOnLoad);
  const [userTracks, setUserTracks] = useState(getUserTracks);
  const tracks = [...defaultTracks, ...userTracks];


  return (
    <PlaybackProvider tracks={tracks}>
      <div className="h-full min-h-0 bg-[#090909] flex justify-center items-center overflow-hidden">
        <main className="relative w-full max-w-[430px] h-full min-h-0 flex flex-col overflow-hidden md:max-h-[800px] bg-[#121212]">
          <div className="flex-1 min-h-0 overflow-hidden pb-20">
            <Playlist
              tracks={tracks}
              onOpenInfo={() => setShowInfoModal(true)}
              onOpenAddSongs={() => setShowAddSongsModal(true)}
              onDeleteTrack={(track) => {
                if (track.userAdded) {
                  removeUserTrack(track.id);
                  setUserTracks((prev) => prev.filter((t) => t.id !== track.id));
                }
              }}
            />
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[min(800px,100dvh)] md:h-[min(800px,85vh)] z-100">
            <Player tracks={tracks} />
          </div>
          <InfoModal
            key={showInfoModal ? 'open' : 'closed'}
            isOpen={showInfoModal}
            onClose={() => setShowInfoModal(false)}
          />
          <AddSongsModal
            key={showAddSongsModal ? 'open' : 'closed'}
            isOpen={showAddSongsModal}
            onClose={() => {
              setShowAddSongsModal(false);
              openedByUrlLoadRef.current = false;
            }}
            onAddTrack={(track) => setUserTracks((prev) => [...prev, track])}
            initialCodeFromUrl={
              openedByUrlLoadRef.current ? getEncodedStrudelFromUrl() : null
            }
          />
        </main>
      </div>
    </PlaybackProvider>
  );
}

export default App;
