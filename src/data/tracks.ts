import birdsOfAFeather from '../assets/birdsOfAFeather.strudel?raw';
import dashOnTheTrain from '../assets/dashOnTheTrain.strudel?raw';
import type { Track } from '../types/track';

export const tracks: Track[] = [
  {
    id: 'birds-of-a-feather',
    title: 'Birds of a Feather',
    artist: 'saga_3k',
    artistUrl: 'https://linktr.ee/saga3k',
    albumArt: '/strudel-player/birdsOfAFeather.png',
    code: birdsOfAFeather,
  },
  {
    id: 'dash-on-the-train',
    title: 'Dash on the Train',
    artist: 'todepond',
    artistUrl: 'https://www.todepond.com/',
    albumArt: '/strudel-player/DashOnTheTrain.png',
    code: dashOnTheTrain,
  },
];
