export interface GlobalPlayerLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  email: string;
  profilePic: string | null;
  inGameUid: string | null;
  inGameName: string | null;
  xp: number;
  playerRank: number;
  totalKills: number;
  totalPoints: number;
  tournamentsPlayed: number;
  tournamentsWon: number;
  winRate: string;
}

export interface GlobalLeaderboardResponse {
  items: GlobalPlayerLeaderboardEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GlobalLeaderboardQuery {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: 'points' | 'kills' | 'xp' | 'tournamentsWon';
}
