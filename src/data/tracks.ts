import birdsOfAFeather from '../assets/birdsOfAFeather.strudel?raw';
import dashOnTheTrain from '../assets/dashOnTheTrain.strudel?raw';
import array from '../assets/array.strudel?raw';
import byDesign from '../assets/byDesign.strudel?raw';
import coastline from '../assets/coastline.strudel?raw';
import codingTrance from '../assets/codingTrance.strudel?raw';
import granularExperiments from '../assets/granularExperiments.strudel?raw';
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
  {
    id: 'array',
    title: 'Array (Lil Data Edit)',
    artist: 'DJ_Dave',
    artistUrl: 'https://djdave.xyz/',
    albumArt: '/strudel-player/array.jpg',
    code: array,
  },
  {
    id: 'by-design',
    title: 'By Design [DJ_Dave Edit]',
    artist: 'Spill Tab',
    artistUrl: 'https://www.spilltab.net/',
    albumArt: '/strudel-player/byDesign.png',
    code: byDesign,
  },
  {
    id: 'coastline',
    title: 'Coastline',
    artist: 'eddyflux',
    artistUrl: 'https://eddyflux.cc/',
    albumArt: '/strudel-player/coastline.jpg',
    code: coastline,
  },
  {
    id: 'coding-trance',
    title: 'Coding Trance',
    artist: 'Switch Angel',
    artistUrl: 'https://www.youtube.com/@Switch-Angel',
    albumArt: '/strudel-player/codingTrance.jpg',
    code: codingTrance,
  },
  {
    id: 'granular-experiments',
    title: 'Granular Experiments',
    artist: 'Switch Angel',
    artistUrl: 'https://www.youtube.com/@Switch-Angel',
    albumArt: '/strudel-player/granularExperiments.jpg',
    code: granularExperiments,
  },
];
