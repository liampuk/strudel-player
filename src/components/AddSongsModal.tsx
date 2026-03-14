import { useState } from 'react';
import Modal from './Modal';
import { addUserTrack } from '../utils/userTracks';
import {
  extractStrudelCode,
  parseMetadataFromCode,
} from '../utils/strudelCode';
import { generateAlbumArtFromCode } from '../utils/albumArtFromCode';
import type { Track } from '../types/track';

interface AddSongsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrack: (track: Track) => void;
  initialCodeFromUrl?: string | null;
}

function getInitialState(initialCode?: string | null) {
  if (initialCode) {
    const meta = parseMetadataFromCode(initialCode);
    return {
      codeInput: initialCode,
      title: meta.title ?? '',
      author: meta.by ?? '',
    };
  }
  return { codeInput: '', title: '', author: '' };
}

export default function AddSongsModal({
  isOpen,
  onClose,
  onAddTrack,
  initialCodeFromUrl,
}: AddSongsModalProps) {
  const initial = getInitialState(initialCodeFromUrl);
  const [codeInput, setCodeInput] = useState(initial.codeInput);
  const [title, setTitle] = useState(initial.title);
  const [author, setAuthor] = useState(initial.author);
  const [error, setError] = useState<string | null>(null);

  const extractedCode = extractStrudelCode(codeInput);

  const handleCodeChange = (value: string) => {
    setCodeInput(value);
    const code = extractStrudelCode(value);
    if (code) {
      const meta = parseMetadataFromCode(code);
      if (meta.title) setTitle(meta.title);
      if (meta.by) setAuthor(meta.by);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const code = extractStrudelCode(codeInput);
    if (!code) {
      setError('Please enter valid Strudel code or a strudel.cc link.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title.');
      return;
    }
    if (!author.trim()) {
      setError('Please enter an author.');
      return;
    }

    try {
      const newTrack = addUserTrack({
        title: title.trim(),
        artist: author.trim(),
        artistUrl: '',
        code,
      });
      onAddTrack(newTrack);
      setCodeInput('');
      setTitle('');
      setAuthor('');
      onClose();
    } catch {
      setError('Failed to add song. Please try again.');
    }
  };

  return (
    <Modal key={isOpen ? 'open' : 'closed'} isOpen={isOpen} onClose={onClose} title="Add song">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="add-song-code"
            className="block text-sm font-medium text-white/90 mb-1"
          >
            Song code or strudel.cc link
          </label>
          <textarea
            id="add-song-code"
            value={codeInput}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="Paste Strudel code or a link from strudel.cc"
            rows={4}
            className="w-full mt-2 px-3 py-2 rounded-md bg-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#1DB954] resize-none"
          />
        </div>
        <div>
          <label
            htmlFor="add-song-title"
            className="block text-sm font-medium text-white/90 mb-1"
          >
            Title
          </label>
          <input
            id="add-song-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Song title"
            className="w-full px-3 mt-2 py-2 rounded-md bg-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
          />
        </div>
        <div>
          <label
            htmlFor="add-song-author"
            className="block text-sm font-medium text-white/90 mb-1"
          >
            Author
          </label>
          <input
            id="add-song-author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name or artist name"
            className="w-full px-3 mt-2 py-2 rounded-md bg-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
          />
        </div>
        {extractedCode && (
          <div>
            <p className="block text-sm font-medium text-white/90 mb-2">
              Generated album art
            </p>
            <img
              src={generateAlbumArtFromCode(extractedCode)}
              alt="Generated album art preview"
              className="w-32 h-32 rounded-md object-cover mt-2"
            />
          </div>
        )}
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full py-3 mt-4 rounded-full bg-[#1DB954] text-[#121212] font-semibold hover:bg-[#1ed760] transition-colors"
        >
          Add to playlist
        </button>
      </form>
    </Modal>
  );
}
