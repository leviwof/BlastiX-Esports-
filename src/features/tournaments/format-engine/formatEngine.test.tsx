import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { calculateFormatLocal } from './utils/formatEngineCalculator';
import { FormatDiagnosticsCard } from './components/FormatDiagnosticsCard';
import { StageRoadmapVisualizer } from './components/StageRoadmapVisualizer';
import { FormatEngineSelector } from './components/FormatEngineSelector';
import { TournamentForm } from '../components/TournamentForm';
import { createDefaultValues } from '../tournament.schema';
import type { GameMode, ValidFormatOption } from './types/formatEngine.types';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

describe('Tournament Format Engine - Core Math Calculator', () => {
  it('calculates valid Squad BR format with 96 teams into stages', () => {
    const res = calculateFormatLocal({
      mode: 'SQUAD_BR',
      capacity: 96,
    });

    expect(res.isValid).toBe(true);
    expect(res.format).toBeDefined();
    expect(res.format?.stages.length).toBeGreaterThanOrEqual(2);

    const firstStage = res.format!.stages[0];
    expect(firstStage.totalUnits).toBe(96);
    expect(firstStage.unitsPerLobby).toBe(12);
    expect(firstStage.lobbyCount).toBe(8);

    const lastStage = res.format!.stages[res.format!.stages.length - 1];
    expect(lastStage.isGrandFinal).toBe(true);
    expect(lastStage.lobbyCount).toBe(1);
    expect(lastStage.totalUnits).toBe(12);
  });

  it('detects invalid Squad BR capacity (e.g. 75 teams) and produces diagnostic reasons & suggestions', () => {
    const res = calculateFormatLocal({
      mode: 'SQUAD_BR',
      capacity: 75,
    });

    expect(res.isValid).toBe(false);
    expect(res.failureReason).toContain('75 teams cannot be evenly divided into 12-team Squad BR lobbies');
    expect(res.suggestedCapacities).toBeDefined();
    expect(res.suggestedCapacities!.length).toBeGreaterThan(0);
    expect(res.suggestedCapacities).toContain(72);
  });

  it('calculates valid Clash Squad single-elimination bracket for 16 teams', () => {
    const res = calculateFormatLocal({
      mode: 'CLASH_SQUAD',
      capacity: 16,
    });

    expect(res.isValid).toBe(true);
    expect(res.format).toBeDefined();
    expect(res.format?.totalRounds).toBe(4);
    expect(res.format?.totalMatches).toBe(15);
    expect(res.format?.csPlan?.rounds[0].matchesCount).toBe(8);
  });

  it('detects invalid Clash Squad capacity (e.g. 10 teams) and suggests nearest powers of 2', () => {
    const res = calculateFormatLocal({
      mode: 'CLASH_SQUAD',
      capacity: 10,
    });

    expect(res.isValid).toBe(false);
    expect(res.failureReason).toContain('not a valid power of 2');
    expect(res.suggestedCapacities).toEqual(expect.arrayContaining([8, 16]));
  });
});

describe('FormatDiagnosticsCard Component', () => {
  it('renders failure reason and triggers onSelectCapacity when clicked', () => {
    const handleSelect = vi.fn();

    render(
      <FormatDiagnosticsCard
        failureReason="75 teams cannot be evenly divided into 12-team Squad BR lobbies"
        suggestedCapacities={[48, 72, 96]}
        unitName="Teams"
        onSelectCapacity={handleSelect}
      />,
    );

    expect(screen.getByText(/75 teams cannot be evenly divided/i)).toBeTruthy();
    expect(screen.getByText('48 Teams')).toBeTruthy();
    expect(screen.getByText('72 Teams')).toBeTruthy();
    expect(screen.getByText('96 Teams')).toBeTruthy();

    fireEvent.click(screen.getByText('72 Teams'));
    expect(handleSelect).toHaveBeenCalledWith(72);
  });
});

describe('StageRoadmapVisualizer Component', () => {
  it('renders stage breakdown and grand final indicators', () => {
    const mockFormat: ValidFormatOption = {
      formatId: 'br-squad-96',
      mode: 'SQUAD_BR',
      capacityUnits: 96,
      totalRounds: 3,
      totalMatches: 11,
      stages: [
        {
          stageNumber: 1,
          stageName: 'Qualifiers',
          lobbyCount: 8,
          unitsPerLobby: 12,
          totalUnits: 96,
          qualifiersPerLobby: 3,
          totalQualifiers: 24,
          wildcardsNeeded: 0,
          isGrandFinal: false,
        },
        {
          stageNumber: 2,
          stageName: 'Semi-Finals',
          lobbyCount: 2,
          unitsPerLobby: 12,
          totalUnits: 24,
          qualifiersPerLobby: 6,
          totalQualifiers: 12,
          wildcardsNeeded: 0,
          isGrandFinal: false,
        },
        {
          stageNumber: 3,
          stageName: 'Grand Final',
          lobbyCount: 1,
          unitsPerLobby: 12,
          totalUnits: 12,
          qualifiersPerLobby: 0,
          totalQualifiers: 1,
          wildcardsNeeded: 0,
          isGrandFinal: true,
        },
      ],
      isRecommended: true,
    };

    render(<StageRoadmapVisualizer format={mockFormat} />);

    expect(screen.getByText('Qualifiers')).toBeTruthy();
    expect(screen.getByText('Semi-Finals')).toBeTruthy();
    expect(screen.getByText('Grand Final')).toBeTruthy();
    expect(screen.getByText('CHAMPIONSHIP')).toBeTruthy();
  });
});

describe('FormatEngineSelector Component', () => {
  function TestWrapper({ initialCapacity = 96, initialMode = 'SQUAD_BR' as GameMode }) {
    const [mode, setMode] = useState<GameMode>(initialMode);
    const [capacity, setCapacity] = useState(initialCapacity);

    return (
      <QueryClientProvider client={createTestQueryClient()}>
        <FormatEngineSelector
          mode={mode}
          capacity={capacity}
          onChangeMode={setMode}
          onChangeCapacity={setCapacity}
        />
      </QueryClientProvider>
    );
  }

  it('displays valid status pill for valid capacity (96 Squad BR)', async () => {
    render(<TestWrapper initialCapacity={96} initialMode="SQUAD_BR" />);

    await waitFor(() => {
      expect(screen.getByTestId('status-valid-pill')).toBeTruthy();
    });
    expect(screen.getByText('VALID FORMAT FOUND')).toBeTruthy();
  });

  it('displays invalid status pill and suggestions when capacity is invalid (75 Squad BR), and clicking suggestion fixes it', async () => {
    render(<TestWrapper initialCapacity={75} initialMode="SQUAD_BR" />);

    await waitFor(() => {
      expect(screen.getByTestId('status-invalid-pill')).toBeTruthy();
    });

    const suggestionBtn = await screen.findByText('72 Teams');
    expect(suggestionBtn).toBeTruthy();

    fireEvent.click(suggestionBtn);

    await waitFor(() => {
      expect(screen.getByTestId('status-valid-pill')).toBeTruthy();
    });
  });
});

describe('TournamentForm Integration with Format Engine', () => {
  it('disables submit button and shows error banner when format capacity is invalid', async () => {
    const queryClient = createTestQueryClient();
    const handleSubmit = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <TournamentForm
          defaultValues={{
            ...createDefaultValues,
            title: 'Championship 2026',
            max_slots: 75, // Invalid capacity for Squad BR
            format_is_valid: false,
          }}
          onSubmit={handleSubmit}
        />
      </QueryClientProvider>,
    );

    const submitBtn = screen.getByRole('button', { name: /save/i }) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
    expect(screen.getByText(/format configuration invalid/i)).toBeTruthy();
  });
});
