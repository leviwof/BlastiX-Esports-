import React from 'react';
import { Shield, Flame, Swords, Trophy, Sparkles, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TournamentRound, RoundStatus } from '../types/brackets.types';

export type StageKey = 'ROUND_1' | 'ROUND_2' | 'WILDCARD' | 'ROUND_3' | 'GRAND_FINAL';

interface TournamentStageStepperProps {
  currentStage: StageKey;
  onSelectStage: (stage: StageKey) => void;
  rounds: TournamentRound[];
  wildCardStatus?: 'CLOSED' | 'OPEN' | 'LOCKED';
}

interface StageStepConfig {
  key: StageKey;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const STAGES: StageStepConfig[] = [
  {
    key: 'ROUND_1',
    title: 'Round 1',
    subtitle: '96 Teams · 8 Groups',
    icon: Swords,
  },
  {
    key: 'ROUND_2',
    title: 'Round 2',
    subtitle: '48 Teams · 4 Groups',
    icon: Flame,
  },
  {
    key: 'WILDCARD',
    title: 'Wild Card',
    subtitle: '8 Teams · Second Chance',
    icon: Sparkles,
  },
  {
    key: 'ROUND_3',
    title: 'Round 3',
    subtitle: '36 Teams · 3 Groups',
    icon: Shield,
  },
  {
    key: 'GRAND_FINAL',
    title: 'Grand Final',
    subtitle: '18 Finalists · 1 Lobby',
    icon: Trophy,
  },
];

export function TournamentStageStepper({
  currentStage,
  onSelectStage,
  rounds,
  wildCardStatus = 'CLOSED',
}: TournamentStageStepperProps) {
  const getRoundStatus = (key: StageKey): { status: RoundStatus | 'OPEN' | 'LOCKED' | 'NOT_STARTED'; label: string } => {
    if (key === 'WILDCARD') {
      if (wildCardStatus === 'OPEN') return { status: 'LIVE' as RoundStatus, label: 'OPEN' };
      if (wildCardStatus === 'LOCKED') return { status: 'COMPLETED' as RoundStatus, label: 'LOCKED' };
      return { status: 'SCHEDULED' as RoundStatus, label: 'CLOSED' };
    }

    const found = rounds.find((r) => r.roundType === key);
    if (!found) return { status: 'NOT_STARTED', label: 'PENDING' };
    return { status: found.status, label: found.status.replace('_', ' ') };
  };

  const getStatusBadge = (statusObj: { status: string; label: string }) => {
    switch (statusObj.status) {
      case 'LIVE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
            <CheckCircle2 className="h-3 w-3" />
            COMPLETED
          </span>
        );
      case 'TIE_BREAKER_PENDING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20 animate-pulse">
            <AlertTriangle className="h-3 w-3" />
            TIE BREAKER
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-foreground-muted border border-white/10">
            <Clock className="h-3 w-3" />
            {statusObj.label}
          </span>
        );
    }
  };

  return (
    <div className="w-full rounded-xl border border-white/10 bg-[#0B0E14]/90 p-3 sm:p-4 backdrop-blur-md shadow-2xl">
      <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#11FBBE] shadow-[0_0_8px_#11FBBE]" />
          <span className="font-mono text-xs uppercase tracking-wider text-[#11FBBE]">
            BLASTiX Multi-Round Progression Engine
          </span>
        </div>
        <span className="text-xs text-foreground-muted">5 Stages Control</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
        {STAGES.map((stage, idx) => {
          const isSelected = currentStage === stage.key;
          const statusObj = getRoundStatus(stage.key);
          const Icon = stage.icon;

          return (
            <button
              key={stage.key}
              type="button"
              onClick={() => onSelectStage(stage.key)}
              className={cn(
                'group relative flex flex-col items-start rounded-lg border p-3 text-left transition-all duration-200',
                isSelected
                  ? 'border-[#11FBBE]/50 bg-gradient-to-b from-[#11FBBE]/10 to-transparent shadow-[0_0_20px_rgba(17,251,190,0.12)]'
                  : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]',
              )}
            >
              {/* Top Row: Icon + Step number */}
              <div className="flex w-full items-center justify-between">
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-md border text-xs',
                    isSelected
                      ? 'border-[#11FBBE]/40 bg-[#11FBBE]/20 text-[#11FBBE]'
                      : 'border-white/10 bg-white/5 text-foreground-muted group-hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-mono text-[11px] text-foreground-muted">
                  0{idx + 1}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="mt-2.5 min-w-0">
                <div className="font-display text-sm font-bold tracking-wide text-foreground">
                  {stage.title}
                </div>
                <div className="truncate text-[11px] text-foreground-muted">
                  {stage.subtitle}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-2.5">
                {getStatusBadge(statusObj)}
              </div>

              {/* Active neon highlight indicator */}
              {isSelected && (
                <div className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-[#11FBBE] shadow-[0_0_8px_#11FBBE]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
