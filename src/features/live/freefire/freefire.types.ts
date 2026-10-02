export interface FreeFireStream {
  id: string;
  title: string;
  channel: string;
  channelUrl: string;
  youtubeId: string;
  isLive: boolean;
  viewerCount?: string;
  language: string;
}

export interface FreeFireStanding {
  rank: number;
  team: string;
  tag: string;
  booyahs: number;
  kills: number;
  rankPoints: number;
  totalPoints: number;
}

export interface FreeFireTournament {
  id: string;
  name: string;
  edition: string;
  status: 'LIVE' | 'UPCOMING' | 'COMPLETED';
  prizePool: string;
  region: string;
  stage: string;
  officialSiteUrl: string;
  dates: string;
  standings?: FreeFireStanding[];
}

export interface FreeFireNewsItem {
  id: string;
  title: string;
  category: 'Esports' | 'Update' | 'Patch' | 'Notice';
  date: string;
  summary: string;
  url: string;
}
