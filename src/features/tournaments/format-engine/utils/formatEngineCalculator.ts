import type {
  GameMode,
  BRStagePlan,
  CSKnockoutPlan,
  ValidFormatOption,
  FormatEngineValidationResult,
  FormatCalculateRequest,
} from '../types/formatEngine.types';

export const MODE_CONFIG: Record<
  GameMode,
  {
    mode: GameMode;
    label: string;
    unitsPerLobby: number;
    finalUnits: number;
    unitName: string;
    description: string;
  }
> = {
  SQUAD_BR: {
    mode: 'SQUAD_BR',
    label: 'Squad BR',
    unitsPerLobby: 12,
    finalUnits: 12,
    unitName: 'Teams',
    description: '12 Teams / Lobby · 48 Players Total / Lobby',
  },
  DUO_BR: {
    mode: 'DUO_BR',
    label: 'Duo BR',
    unitsPerLobby: 24,
    finalUnits: 24,
    unitName: 'Duos',
    description: '24 Duos / Lobby · 48 Players Total / Lobby',
  },
  SOLO_BR: {
    mode: 'SOLO_BR',
    label: 'Solo BR',
    unitsPerLobby: 48,
    finalUnits: 48,
    unitName: 'Players',
    description: '48 Solo Players / Lobby',
  },
  CLASH_SQUAD: {
    mode: 'CLASH_SQUAD',
    label: 'Clash Squad (4v4 Knockout)',
    unitsPerLobby: 2,
    finalUnits: 2,
    unitName: 'Teams',
    description: 'Knockout Bracket · 2 Teams / Match',
  },
};

function gcd(a: number, b: number): number {
  let x = a;
  let y = b;
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function legalQualifierCounts(groupCount: number, lobbySize: number): number[] {
  const step = lobbySize / gcd(lobbySize, groupCount);
  const result: number[] = [];
  for (let q = step; q < lobbySize; q += step) {
    result.push(q);
  }
  return result;
}

interface InternalBRPath {
  stages: {
    round: number;
    units: number;
    groups: number;
    qualifyPerGroup: number;
    isFinal: boolean;
  }[];
  totalRounds: number;
}

function searchPaths(
  N: number,
  L: number,
  finalUnits: number,
  roundsLeft: number,
  roundNumber: number,
  memo: Map<string, InternalBRPath[]> = new Map(),
): InternalBRPath[] {
  const key = `${N}:${roundsLeft}:${roundNumber}`;
  if (memo.has(key)) return memo.get(key)!;

  if (N === finalUnits) {
    if (roundsLeft >= 0) {
      const res: InternalBRPath[] = [
        {
          stages: [
            {
              round: roundNumber,
              units: N,
              groups: 1,
              qualifyPerGroup: 0,
              isFinal: true,
            },
          ],
          totalRounds: 1,
        },
      ];
      memo.set(key, res);
      return res;
    }
    memo.set(key, []);
    return [];
  }

  if (roundsLeft <= 0 || N % L !== 0 || N < finalUnits) {
    memo.set(key, []);
    return [];
  }

  const G = N / L;
  const legalQs = legalQualifierCounts(G, L);
  const paths: InternalBRPath[] = [];

  for (const Q of legalQs) {
    const nextN = G * Q;
    if (nextN >= finalUnits && nextN < N && nextN % L === 0) {
      const subPaths = searchPaths(nextN, L, finalUnits, roundsLeft - 1, roundNumber + 1, memo);
      for (const sp of subPaths) {
        paths.push({
          stages: [
            {
              round: roundNumber,
              units: N,
              groups: G,
              qualifyPerGroup: Q,
              isFinal: false,
            },
            ...sp.stages,
          ],
          totalRounds: 1 + sp.totalRounds,
        });
      }
    }
  }

  memo.set(key, paths);
  return paths;
}

function getStageName(stageIndex: number, totalStages: number): string {
  if (stageIndex === totalStages - 1) return 'Grand Final';
  if (stageIndex === totalStages - 2) return 'Semi-Finals';
  if (stageIndex === totalStages - 3) return 'Quarter-Finals';
  if (stageIndex === 0) return 'Qualifiers (Round 1)';
  return `Stage ${stageIndex + 1}`;
}

function buildBRStagePlans(
  path: InternalBRPath,
  unitsPerLobby: number,
): BRStagePlan[] {
  const totalStages = path.stages.length;
  return path.stages.map((stage, idx) => {
    const isGrandFinal = stage.isFinal;
    const stageName = getStageName(idx, totalStages);
    const lobbyCount = stage.groups;
    const totalUnits = stage.units;
    const qualifiersPerLobby = stage.qualifyPerGroup;
    const totalQualifiers = isGrandFinal ? 1 : lobbyCount * qualifiersPerLobby;

    return {
      stageNumber: idx + 1,
      stageName,
      lobbyCount,
      unitsPerLobby,
      totalUnits,
      qualifiersPerLobby,
      totalQualifiers,
      wildcardsNeeded: 0,
      isGrandFinal,
    };
  });
}

function buildClashSquadPlan(capacity: number): CSKnockoutPlan {
  const rounds: CSKnockoutPlan['rounds'] = [];
  let remaining = capacity;
  let roundNum = 1;
  const totalRounds = Math.log2(capacity);

  while (remaining > 1) {
    const matchesCount = remaining / 2;
    let roundName = `Round ${roundNum}`;
    if (remaining === 2) roundName = 'Championship Final';
    else if (remaining === 4) roundName = 'Semi-Finals';
    else if (remaining === 8) roundName = 'Quarter-Finals';
    else if (remaining === 16) roundName = 'Round of 16';
    else if (remaining === 32) roundName = 'Round of 32';
    else if (remaining === 64) roundName = 'Round of 64';

    rounds.push({
      roundNumber: roundNum,
      roundName,
      matchesCount,
      participatingTeams: remaining,
    });
    remaining = matchesCount;
    roundNum++;
  }

  return {
    totalTeams: capacity,
    totalRounds,
    firstRoundMatches: capacity / 2,
    byesCount: 0,
    rounds,
  };
}

export function calculateFormatLocal(
  req: FormatCalculateRequest,
): FormatEngineValidationResult {
  const { mode, capacity, maxRounds = 5, exactRounds } = req;
  const cfg = MODE_CONFIG[mode];

  if (!capacity || capacity <= 0) {
    return {
      isValid: false,
      mode,
      capacity: capacity || 0,
      failureReason: 'Target capacity must be greater than 0.',
    };
  }

  // --- Clash Squad Mode (Knockout) ---
  if (mode === 'CLASH_SQUAD') {
    const isPowerOfTwo = capacity >= 2 && (capacity & (capacity - 1)) === 0;
    if (!isPowerOfTwo) {
      // Find nearest powers of 2
      let lower = 1;
      while (lower * 2 <= capacity) {
        lower *= 2;
      }
      const higher = lower * 2;
      const suggestions = [
        ...(lower >= 2 ? [lower] : []),
        higher,
        higher * 2,
      ].filter((n, idx, arr) => arr.indexOf(n) === idx && n <= 128);

      return {
        isValid: false,
        mode,
        capacity,
        failureReason: `${capacity} teams is not a valid power of 2 for Clash Squad knockout brackets.`,
        violations: [
          `Single-elimination knockout brackets require powers of 2 (2, 4, 8, 16, 32, 64, 128) to avoid fractional matches.`,
        ],
        suggestedCapacities: suggestions,
      };
    }

    const csPlan = buildClashSquadPlan(capacity);
    const totalMatches = capacity - 1;
    const formatOption: ValidFormatOption = {
      formatId: `cs-${capacity}`,
      mode,
      capacityUnits: capacity,
      totalRounds: csPlan.totalRounds,
      totalMatches,
      stages: csPlan.rounds.map((r, i) => ({
        stageNumber: r.roundNumber,
        stageName: r.roundName,
        lobbyCount: r.matchesCount,
        unitsPerLobby: 2,
        totalUnits: r.participatingTeams,
        qualifiersPerLobby: 1,
        totalQualifiers: r.matchesCount,
        wildcardsNeeded: 0,
        isGrandFinal: i === csPlan.rounds.length - 1,
      })),
      csPlan,
      isRecommended: true,
    };

    return {
      isValid: true,
      mode,
      capacity,
      format: formatOption,
      alternativeFormats: [formatOption],
    };
  }

  // --- Battle Royale Modes ---
  const L = cfg.unitsPerLobby;
  const finalUnits = cfg.finalUnits;

  if (capacity % L !== 0) {
    const groups = Math.floor(capacity / L);
    const remainder = capacity % L;
    const lower = Math.max(L, groups * L);
    const higher = (groups + 1) * L;
    const suggestions = [
      Math.max(L, lower - L),
      lower,
      higher,
      higher + L,
    ]
      .filter((n, idx, arr) => n >= L && arr.indexOf(n) === idx)
      .slice(0, 4);

    return {
      isValid: false,
      mode,
      capacity,
      failureReason: `${capacity} ${cfg.unitName.toLowerCase()} cannot be evenly divided into ${L}-${cfg.unitName.toLowerCase().replace(/s$/, '')} ${cfg.label} lobbies (${capacity} ÷ ${L} = ${groups} groups with ${remainder} leftover ${cfg.unitName.toLowerCase()}).`,
      violations: [
        `Every Battle Royale lobby requires exactly ${L} ${cfg.unitName.toLowerCase()} for competitive parity.`,
        `Uneven group sizes cause lobby mismatches and corrupted leaderboard standings.`,
      ],
      suggestedCapacities: suggestions,
    };
  }

  if (capacity < finalUnits) {
    return {
      isValid: false,
      mode,
      capacity,
      failureReason: `Minimum tournament capacity for ${cfg.label} is ${finalUnits} ${cfg.unitName.toLowerCase()} (1 full final lobby).`,
      suggestedCapacities: [finalUnits, finalUnits * 2, finalUnits * 3],
    };
  }

  // Find valid paths
  const paths = searchPaths(capacity, L, finalUnits, maxRounds, 1);
  const filtered = exactRounds
    ? paths.filter((p) => p.totalRounds === exactRounds)
    : paths;

  if (filtered.length === 0) {
    return {
      isValid: false,
      mode,
      capacity,
      failureReason: `No valid symmetrical qualification path could be formed for ${capacity} ${cfg.unitName.toLowerCase()} within ${maxRounds} rounds.`,
      violations: [
        `Progression requires an integer number of qualifiers per lobby that cleanly fills the next stage's lobbies.`,
      ],
      suggestedCapacities: [48, 72, 96, 144].filter((n) => n !== capacity),
    };
  }

  // Convert to ValidFormatOptions
  const formatOptions: ValidFormatOption[] = filtered.map((p, idx) => {
    const stages = buildBRStagePlans(p, L);
    const totalMatches = stages.reduce((sum, s) => sum + s.lobbyCount, 0);
    return {
      formatId: `br-${mode.toLowerCase()}-${capacity}-path${idx + 1}`,
      mode,
      capacityUnits: capacity,
      totalRounds: p.totalRounds,
      totalMatches,
      stages,
      isRecommended: idx === 0,
    };
  });

  return {
    isValid: true,
    mode,
    capacity,
    format: formatOptions[0],
    alternativeFormats: formatOptions,
  };
}
