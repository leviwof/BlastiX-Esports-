export type TournamentRoundType = 'ROUND_1' | 'ROUND_2' | 'ROUND_3' | 'GRAND_FINAL';

export type RoundStatus = 'SCHEDULED' | 'LIVE' | 'TIE_BREAKER_PENDING' | 'COMPLETED';

export type QualificationDestination = 'ROUND_2' | 'ROUND_3' | 'GRAND_FINAL' | 'ELIMINATED';

export type WildCardStatus = 'CLOSED' | 'OPEN' | 'LOCKED';

export interface GroupTeam {
  id: string;
  groupId: string;
  tournamentTeamId: string;
  seed: number | null;
  rank: number | null;
  kills: number;
  placementPoints: number;
  totalPoints: number;
  tournamentTeam?: {
    id: string;
    name: string;
    tag: string;
    logoUrl?: string | null;
    captain?: {
      id: string;
      name: string;
    } | null;
  };
}

export interface TournamentGroup {
  id: string;
  roundId: string;
  groupNumber: number;
  name: string;
  roomId?: string | null;
  roomPassword?: string | null;
  credentialsReleasedAt?: string | null;
  groupTeams: GroupTeam[];
}

export interface RoundQualification {
  id: string;
  roundId: string;
  tournamentTeamId: string;
  destination: QualificationDestination;
  isManualOverride: boolean;
  reason?: string | null;
  promotedByUserId?: string | null;
  createdAt: string;
  tournamentTeam?: {
    id: string;
    name: string;
    tag: string;
  };
}

export interface TournamentTieBreaker {
  id: string;
  roundId: string;
  groupId: string;
  tiedTeamIds: string[];
  recommendedTeamId: string;
  selectedTeamId?: string | null;
  isResolved: boolean;
  resolvedByUserId?: string | null;
  resolvedAt?: string | null;
  round?: {
    id: string;
    roundType: TournamentRoundType;
    roundNumber: number;
  };
}

export interface TournamentRound {
  id: string;
  tournamentId: string;
  roundType: TournamentRoundType;
  roundNumber: number;
  status: RoundStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  groups: TournamentGroup[];
  qualifications?: RoundQualification[];
  tieBreakers?: TournamentTieBreaker[];
}

export interface WildCardSlot {
  id: string;
  windowId: string;
  tournamentTeamId: string;
  slotNumber: number;
  isManualAdminSlot: boolean;
  assignedByUserId?: string | null;
  assignedAt: string;
  tournamentTeam?: {
    id: string;
    name: string;
    tag: string;
    logoUrl?: string | null;
    captain?: {
      id: string;
      name: string;
    } | null;
  };
}

export interface WildCardWindow {
  id: string;
  tournamentId: string;
  status: WildCardStatus;
  entryFee: number;
  maxSlots: number;
  openedAt?: string | null;
  closedAt?: string | null;
  slots: WildCardSlot[];
}

export interface OpenWildCardPayload {
  entryFee?: number;
}

export interface AssignWildCardSlotPayload {
  teamId: string;
  slotNumber: number;
}

export interface ResolveTieBreakerPayload {
  selectedTeamId: string;
}

export interface FillGrandFinalSlotPayload {
  teamId: string;
  reason?: string;
}

export interface AssembleGrandFinalPayload {
  specialInviteTeamId?: string;
}

export interface SetGroupRoomCredentialsPayload {
  roomId: string;
  roomPassword: string;
  credentialsReleasedAt?: string;
  releaseNow?: boolean;
}

export interface TeamScoreEntry {
  tournamentTeamId: string;
  kills: number;
  placement: number;
}

export interface SubmitGroupScoresPayload {
  scores: TeamScoreEntry[];
}
