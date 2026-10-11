export type GameMode = 'SQUAD_BR' | 'DUO_BR' | 'SOLO_BR' | 'CLASH_SQUAD';

export interface BRStagePlan {
  stageNumber: number;
  stageName: string;
  lobbyCount: number;
  unitsPerLobby: number;
  totalUnits: number;
  qualifiersPerLobby: number;
  totalQualifiers: number;
  wildcardsNeeded: number;
  isGrandFinal: boolean;
}

export interface CSKnockoutPlan {
  totalTeams: number;
  totalRounds: number;
  firstRoundMatches: number;
  byesCount: number;
  rounds: {
    roundNumber: number;
    roundName: string;
    matchesCount: number;
    participatingTeams: number;
  }[];
}

export interface ValidFormatOption {
  formatId: string;
  mode: GameMode;
  capacityUnits: number;
  totalRounds: number;
  totalMatches: number;
  stages: BRStagePlan[];
  csPlan?: CSKnockoutPlan;
  isRecommended?: boolean;
}

export interface FormatEngineValidationResult {
  isValid: boolean;
  mode: GameMode;
  capacity: number;
  format?: ValidFormatOption;
  failureReason?: string;
  violations?: string[];
  suggestedCapacities?: number[];
  alternativeFormats?: ValidFormatOption[];
}

export interface FormatCalculateRequest {
  mode: GameMode;
  capacity: number;
  maxRounds?: number;
  exactRounds?: number;
}

export interface FormatSearchRequest {
  mode: GameMode;
  minCapacity?: number;
  maxCapacity?: number;
  preferredRounds?: number;
}
