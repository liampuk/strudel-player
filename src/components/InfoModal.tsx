import Modal from './Modal';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  return (
    <Modal
      key={isOpen ? 'open' : 'closed'}
      isOpen={isOpen}
      onClose={onClose}
      title="About"
    >
      <div className="space-y-4 text-sm text-white/80 mb-8">
        <p>
          Streaming app for{' '}
          <a
            className="text-[#1DB954] font-semibold"
            href="https://strudel.cc"
            target="_blank"
            rel="noopener noreferrer"
          >
            Strudel
          </a>{' '}
          - a pattern language for writing music.
        </p>
        <p>
          Add new songs with the Add songs button, or replace links links from{' '}
          <span className="font-semibold text-white">strudel.cc</span> with{' '}
          <span className="font-semibold text-white">
            liamp.uk/strudel-player
          </span>
          .
        </p>
        <div className="overflow-hidden rounded-xl">
          <video
            src="/strudel-player/title-replace.mp4"
            playsInline
            autoPlay
            loop
            className="w-[calc(100%+2px)] h-[56px] -ml-0.5"
          />
        </div>
        <p>
          Adding a song stores it on your device so you can listen to it later.
          If you'd like to add a song for everyone, submit it{' '}
          <a
            className="text-[#1DB954] font-semibold hover:text-[#1ed760]"
            href="https://github.com/liampuk/strudel-player"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
          .
        </p>
        <p>
          Built by{' '}
          <a
            className="text-[#1DB954] font-semibold hover:text-[#1ed760]"
            href="https://liamp.uk"
            target="_blank"
            rel="noopener noreferrer"
          >
            Liam
          </a>
        </p>
      </div>
    </Modal>
  );
}
