import Modal from './Modal';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="About">
      <div className="space-y-4 text-sm text-white/80">
        <p>
          Streaming app for{' '}
          <a
            className="text-[#1DB954] font-semibold"
            href="https://strudel.tidalcycles.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Strudel
          </a>{' '}
          - a pattern language for writing music.
        </p>
        <p>
          Browse the current list of tracks. Have a song you&apos;d like to add?
          Submit it{' '}
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
          .
        </p>
      </div>
    </Modal>
  );
}
