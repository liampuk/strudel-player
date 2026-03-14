import type { Track } from '../types/track';
import { generateAlbumArtFromCode } from './albumArtFromCode';

const STORAGE_KEY = 'strudel-player-user-tracks';

export function getUserTracks(): Track[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Track[];
    const tracks = Array.isArray(parsed) ? parsed : [];
    return tracks.map((t) =>
      t.userAdded
        ? { ...t, albumArt: generateAlbumArtFromCode(t.code) }
        : t
    );
  } catch {
    return [];
  }
}

export function saveUserTracks(tracks: Track[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  } catch {
    // Ignore storage errors
  }
}

export function removeUserTrack(trackId: string): void {
  const userTracks = getUserTracks().filter((t) => t.id !== trackId);
  saveUserTracks(userTracks);
}

export function addUserTrack(
  track: Omit<Track, 'id' | 'userAdded' | 'albumArt'> & { albumArt?: string }
): Track {
  const userTracks = getUserTracks();
  const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const newTrack: Track = {
    ...track,
    id,
    albumArt: track.albumArt ?? generateAlbumArtFromCode(track.code),
    userAdded: true,
  };
  userTracks.push(newTrack);
  saveUserTracks(userTracks);
  return newTrack;
}
