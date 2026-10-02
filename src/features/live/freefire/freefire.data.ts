import type {
  FreeFireStream,
  FreeFireStanding,
  FreeFireTournament,
  FreeFireNewsItem,
} from './freefire.types';

export const OFFICIAL_FF_LINKS = {
  mainSite: 'https://ff.garena.com',
  esportsHub: 'https://esports.ff.garena.com',
  rewardSite: 'https://reward.ff.garena.com',
  indiaChannel: 'https://www.youtube.com/@FreeFireIndiaOfficial',
  esportsChannel: 'https://www.youtube.com/@FreeFireEsportsOfficial',
  instagram: 'https://www.instagram.com/freefireindiaofficial',
};

export const OFFICIAL_FF_STREAMS: FreeFireStream[] = [
  {
    id: 'ff-india-official',
    title: 'Free Fire India Official Broadcast — Live Arena',
    channel: 'Free Fire India Official',
    channelUrl: OFFICIAL_FF_LINKS.indiaChannel,
    youtubeId: 'live_stream', // channels fallback / custom stream
    isLive: true,
    viewerCount: '48.2K Watching',
    language: 'Hindi / English',
  },
  {
    id: 'ffws-global',
    title: 'Free Fire World Series (FFWS) Global Championship',
    channel: 'Free Fire Esports Official',
    channelUrl: OFFICIAL_FF_LINKS.esportsChannel,
    youtubeId: 'y-uC80b7-g4', // standard esports live/highlight stream
    isLive: true,
    viewerCount: '124K Watching',
    language: 'English',
  },
  {
    id: 'ff-sea-championship',
    title: 'FFWS Southeast Asia Spring — Grand Finals',
    channel: 'Garena Free Fire Official',
    channelUrl: 'https://www.youtube.com/@GarenaFreeFire',
    youtubeId: 'Vw9T4v9dC_Q',
    isLive: false,
    viewerCount: '92K Views',
    language: 'English',
  },
];

export const FFWS_STANDINGS: FreeFireStanding[] = [
  { rank: 1, team: 'Buriram United Esports', tag: 'BRU', booyahs: 3, kills: 48, rankPoints: 42, totalPoints: 90 },
  { rank: 2, team: 'EVOS Phoenix', tag: 'EVOS', booyahs: 2, kills: 42, rankPoints: 36, totalPoints: 78 },
  { rank: 3, team: 'Magic Squad', tag: 'MS', booyahs: 1, kills: 39, rankPoints: 31, totalPoints: 70 },
  { rank: 4, team: 'Attack All Around', tag: 'AAA', booyahs: 1, kills: 35, rankPoints: 28, totalPoints: 63 },
  { rank: 5, team: 'RRQ Kazu', tag: 'RRQ', booyahs: 1, kills: 32, rankPoints: 24, totalPoints: 56 },
  { rank: 6, team: 'WAG Esports', tag: 'WAG', booyahs: 0, kills: 34, rankPoints: 20, totalPoints: 54 },
  { rank: 7, team: 'LOUD Esports', tag: 'LOUD', booyahs: 1, kills: 27, rankPoints: 18, totalPoints: 45 },
  { rank: 8, team: 'Minerva Esports', tag: 'MNV', booyahs: 0, kills: 24, rankPoints: 16, totalPoints: 40 },
  { rank: 9, team: 'Morph Team', tag: 'MRP', booyahs: 0, kills: 22, rankPoints: 14, totalPoints: 36 },
  { rank: 10, team: 'All Glory Gaming', tag: 'AGG', booyahs: 0, kills: 18, rankPoints: 12, totalPoints: 30 },
];

export const OFFICIAL_FF_TOURNAMENTS: FreeFireTournament[] = [
  {
    id: 'ffws-2026',
    name: 'Free Fire World Series (FFWS)',
    edition: 'Global Finals 2026',
    status: 'LIVE',
    prizePool: '$1,000,000 USD',
    region: 'International',
    stage: 'Grand Finals — Day 3',
    officialSiteUrl: 'https://esports.ff.garena.com',
    dates: 'Live Now',
    standings: FFWS_STANDINGS,
  },
  {
    id: 'ffic-2026',
    name: 'Free Fire India Championship (FFIC)',
    edition: 'National Series',
    status: 'UPCOMING',
    prizePool: '₹1,00,00,000 INR',
    region: 'India / South Asia',
    stage: 'Play-Ins Stage',
    officialSiteUrl: 'https://ff.garena.com',
    dates: 'Starting this weekend',
  },
  {
    id: 'ff-clash-squad',
    name: 'Free Fire Clash Squad Invitational',
    edition: 'Pro Division',
    status: 'LIVE',
    prizePool: '$250,000 USD',
    region: 'Global',
    stage: 'Knockout Stage',
    officialSiteUrl: 'https://esports.ff.garena.com',
    dates: 'Matches In Progress',
  },
];

export const OFFICIAL_FF_NEWS: FreeFireNewsItem[] = [
  {
    id: 'n1',
    title: 'Free Fire MAX OB44/OB45 Competitive Balance Notes',
    category: 'Patch',
    date: 'Official Release',
    summary: 'Adjustments to weapon handling, character abilities, and official tournament map rotations.',
    url: 'https://ff.garena.com',
  },
  {
    id: 'n2',
    title: 'FFWS Global Official Scoring Matrix & Rulebook',
    category: 'Esports',
    date: 'Official Garena Esports',
    summary: 'Standardized competitive scoring: Booyah yields 12 points, 2nd 9 points, 3rd 8 points, +1 point per elimination.',
    url: 'https://esports.ff.garena.com',
  },
  {
    id: 'n3',
    title: 'Official Anti-Cheat Advisory: Operation Cutcord',
    category: 'Notice',
    date: 'Garena Security',
    summary: 'Stringent device fingerprinting and automated emulator restrictions enforced for all competitive lobbies.',
    url: 'https://ff.garena.com',
  },
];
