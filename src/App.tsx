import { useState } from 'react';
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
  const [showAddSongsModal, setShowAddSongsModal] =
    useState(hasEncodedCodeOnLoad);
  const [openedByUrlLoad, setOpenedByUrlLoad] = useState(hasEncodedCodeOnLoad);
  const [userTracks, setUserTracks] = useState(getUserTracks);
  const tracks = [...defaultTracks, ...userTracks];

  return (
    <PlaybackProvider tracks={tracks}>
      <div className="h-full min-h-0 bg-[#090909] flex justify-center items-center overflow-hidden">
        <div className="relative w-full md:max-w-[400px] h-full min-h-0 md:max-h-[min(824px,88vh)] md:p-[8px] md:border-2 md:border-white/80 md:rounded-[36px] md:bg-black">
          {/* Power button - right side */}
          <div
            className="absolute -right-[5px] top-[25%] hidden h-16 w-[4px] -translate-y-1/2 rounded-r bg-white/80 md:block"
            aria-hidden
          />
          {/* Volume up - left side */}
          <div
            className="absolute -left-[5px] top-[16%] hidden h-8 w-[4px] -translate-y-1/2 rounded-l bg-white/80 md:block"
            aria-hidden
          />
          {/* Volume up - left side */}
          <div
            className="absolute -left-[5px] top-[25%] hidden h-12 w-[4px] -translate-y-1/2 rounded-l bg-white/80 md:block"
            aria-hidden
          />
          {/* Volume down - left side */}
          <div
            className="absolute -left-[5px] top-[35%] hidden h-12 w-[4px] -translate-y-1/2 rounded-l bg-white/80 md:block"
            aria-hidden
          />
          <main className="relative w-full h-full min-h-0 flex flex-col overflow-hidden md:rounded-[24px] bg-[#121212]">
            <div className="flex-1 min-h-0 overflow-hidden">
              <Playlist
                tracks={tracks}
                onOpenInfo={() => setShowInfoModal(true)}
                onOpenAddSongs={() => setShowAddSongsModal(true)}
                onDeleteTrack={(track) => {
                  if (track.userAdded) {
                    removeUserTrack(track.id);
                    setUserTracks((prev) =>
                      prev.filter((t) => t.id !== track.id)
                    );
                  }
                }}
              />
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[min(800px,100dvh)] md:h-[min(800px,85vh)] z-100">
              <Player tracks={tracks} />
            </div>
            <InfoModal
              key={showInfoModal ? 'info-modal-open' : 'info-modal-closed'}
              isOpen={showInfoModal}
              onClose={() => setShowInfoModal(false)}
            />
            <AddSongsModal
              key={
                showAddSongsModal
                  ? 'add-songs-modal-open'
                  : 'add-songs-modal-closed'
              }
              isOpen={showAddSongsModal}
              onClose={() => {
                setShowAddSongsModal(false);
                setOpenedByUrlLoad(false);
              }}
              onAddTrack={(track) => setUserTracks((prev) => [...prev, track])}
              initialCodeFromUrl={
                openedByUrlLoad ? getEncodedStrudelFromUrl() : null
              }
            />
          </main>
        </div>
      </div>
    </PlaybackProvider>
  );
}

export default App;
