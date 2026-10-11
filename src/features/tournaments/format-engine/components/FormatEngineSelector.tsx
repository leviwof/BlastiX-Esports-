import React, { useState, useEffect } from 'react';
import type {
  GameMode,
  ValidFormatOption,
  FormatEngineValidationResult,
} from '../types/formatEngine.types';
import { useFormatEngine } from '../hooks/useFormatEngine';
import { MODE_CONFIG } from '../utils/formatEngineCalculator';
import { FormatDiagnosticsCard } from './FormatDiagnosticsCard';
import { FormatAlternativePicker } from './FormatAlternativePicker';
import { StageRoadmapVisualizer } from './StageRoadmapVisualizer';
import { ClashSquadBracketPreview } from './ClashSquadBracketPreview';
import {
  Users,
  UserCheck,
  User,
  Swords,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sliders,
} from 'lucide-react';

interface FormatEngineSelectorProps {
  mode: GameMode;
  capacity: number;
  maxRounds?: number;
  exactRounds?: number;
  onChangeMode: (mode: GameMode) => void;
  onChangeCapacity: (capacity: number) => void;
  onFormatChange?: (result: FormatEngineValidationResult) => void;
  onSelectedFormatChange?: (format: ValidFormatOption | undefined) => void;
}

const PRESET_CAPACITIES: Record<GameMode, number[]> = {
  SQUAD_BR: [48, 96, 144, 192],
  DUO_BR: [24, 48, 72, 96],
  SOLO_BR: [48, 96, 144, 192],
  CLASH_SQUAD: [8, 16, 32, 64],
};

const MODE_ICONS: Record<GameMode, React.ElementType> = {
  SQUAD_BR: Users,
  DUO_BR: UserCheck,
  SOLO_BR: User,
  CLASH_SQUAD: Swords,
};

export const FormatEngineSelector: React.FC<FormatEngineSelectorProps> = ({
  mode,
  capacity,
  maxRounds: initialMaxRounds,
  exactRounds: initialExactRounds,
  onChangeMode,
  onChangeCapacity,
  onFormatChange,
  onSelectedFormatChange,
}) => {
  const [showConstraints, setShowConstraints] = useState(false);
  const [maxRounds, setMaxRounds] = useState<number | undefined>(initialMaxRounds);
  const [exactRounds, setExactRounds] = useState<number | undefined>(initialExactRounds);
  const [selectedFormatOverride, setSelectedFormatOverride] = useState<ValidFormatOption | null>(null);

  const { data: validationResult, isLoading, isDebouncing } = useFormatEngine({
    mode,
    capacity,
    maxRounds,
    exactRounds,
  });

  // Whenever mode or capacity changes, reset local override
  useEffect(() => {
    setSelectedFormatOverride(null);
  }, [mode, capacity]);

  // Notify parent of validation changes
  useEffect(() => {
    if (validationResult) {
      onFormatChange?.(validationResult);
      if (validationResult.isValid) {
        const activeFormat = selectedFormatOverride || validationResult.format;
        onSelectedFormatChange?.(activeFormat);
      } else {
        onSelectedFormatChange?.(undefined);
      }
    }
  }, [validationResult, selectedFormatOverride, onFormatChange, onSelectedFormatChange]);

  const activeFormat: ValidFormatOption | undefined =
    selectedFormatOverride || validationResult?.format;

  const currentCfg = MODE_CONFIG[mode];
  const presets = PRESET_CAPACITIES[mode];

  return (
    <div
      data-testid="format-engine-selector"
      className="space-y-5 rounded-2xl border border-white/10 bg-gradient-to-b from-[#12141D] to-[#0D0E15] p-5 shadow-xl"
    >
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-bold uppercase tracking-wider text-white">
              Tournament Format Engine
            </span>
            <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary border border-primary/20">
              V2 DYNAMIC
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Guarantees mathematically balanced lobbies, group parity, and seamless stage progression.
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2">
          {isLoading || isDebouncing ? (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Verifying Math...</span>
            </div>
          ) : validationResult?.isValid ? (
            <div
              data-testid="status-valid-pill"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>VALID FORMAT FOUND</span>
            </div>
          ) : (
            <div
              data-testid="status-invalid-pill"
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>INVALID CAPACITY: LOBBY MISMATCH</span>
            </div>
          )}
        </div>
      </div>

      {/* 1. Game Mode Selection Radio Cards */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          1. Choose Game Mode & Lobby Type
        </label>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {(['SQUAD_BR', 'DUO_BR', 'SOLO_BR', 'CLASH_SQUAD'] as GameMode[]).map((m) => {
            const isSelected = mode === m;
            const cfg = MODE_CONFIG[m];
            const Icon = MODE_ICONS[m];

            return (
              <button
                key={m}
                type="button"
                onClick={() => onChangeMode(m)}
                className={`relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(245,166,35,0.2)] ring-1 ring-amber-400/30 text-white'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] text-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isSelected ? 'bg-amber-400 text-black' : 'bg-white/5 text-zinc-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_#F5A623]" />
                    )}
                  </div>
                  <h5 className="mt-2.5 font-display text-sm font-bold">{cfg.label}</h5>
                  <p className="mt-1 text-[11px] text-zinc-400 leading-tight">
                    {cfg.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Target Capacity Input & Preset Buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="target_capacity_input" className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            2. Target Capacity ({currentCfg.unitName})
          </label>
          <span className="text-[11px] text-zinc-400">
            Must be clean multiple of {currentCfg.unitsPerLobby}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              id="target_capacity_input"
              type="number"
              min={1}
              value={capacity || ''}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onChangeCapacity(Number.isNaN(val) ? 0 : val);
              }}
              placeholder={`e.g. ${presets[1] || 96}`}
              className="w-full rounded-xl border border-white/10 bg-surface-2/80 px-4 py-2.5 font-mono text-base font-bold text-white placeholder-zinc-500 shadow-inner focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400">
              {currentCfg.unitName}
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-500 mr-1">Presets:</span>
            {presets.map((preset) => {
              const isActive = capacity === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChangeCapacity(preset)}
                  className={`rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold transition-all ${
                    isActive
                      ? 'border border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_10px_rgba(245,166,35,0.2)]'
                      : 'border border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Optional Stage Constraints Toggle */}
      <div className="border-t border-white/5 pt-3">
        <button
          type="button"
          onClick={() => setShowConstraints(!showConstraints)}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <Sliders className="h-3.5 w-3.5 text-cyan-400" />
          <span>{showConstraints ? 'Hide Advanced Constraints' : 'Show Advanced Stage Constraints'}</span>
        </button>

        {showConstraints && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 animate-in fade-in duration-150">
            <div>
              <label htmlFor="max_rounds_input" className="text-[11px] font-semibold text-zinc-400">
                Max Elimination Rounds
              </label>
              <input
                id="max_rounds_input"
                type="number"
                min={1}
                max={8}
                value={maxRounds ?? ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setMaxRounds(Number.isNaN(val) ? undefined : val);
                }}
                placeholder="Default: 5"
                className="mt-1 w-full rounded-lg border border-white/10 bg-surface px-3 py-1.5 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="exact_rounds_input" className="text-[11px] font-semibold text-zinc-400">
                Exact Stages Required (Optional)
              </label>
              <input
                id="exact_rounds_input"
                type="number"
                min={1}
                max={8}
                value={exactRounds ?? ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setExactRounds(Number.isNaN(val) ? undefined : val);
                }}
                placeholder="Leave blank for any"
                className="mt-1 w-full rounded-lg border border-white/10 bg-surface px-3 py-1.5 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Real-Time Feedback Section */}
      {validationResult && !validationResult.isValid && (
        <FormatDiagnosticsCard
          failureReason={validationResult.failureReason}
          violations={validationResult.violations}
          suggestedCapacities={validationResult.suggestedCapacities}
          unitName={currentCfg.unitName}
          onSelectCapacity={onChangeCapacity}
        />
      )}

      {/* 5. Alternative Formats Picker (if multiple valid options) */}
      {validationResult?.isValid && validationResult.alternativeFormats && (
        <FormatAlternativePicker
          alternatives={validationResult.alternativeFormats}
          selectedFormatId={activeFormat?.formatId || ''}
          onSelectFormat={setSelectedFormatOverride}
        />
      )}

      {/* 6. Visual Bracket / Stage Visualizer */}
      {validationResult?.isValid && activeFormat && (
        <>
          {mode === 'CLASH_SQUAD' ? (
            <ClashSquadBracketPreview format={activeFormat} />
          ) : (
            <StageRoadmapVisualizer format={activeFormat} />
          )}
        </>
      )}
    </div>
  );
};
