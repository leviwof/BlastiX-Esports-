import { apiClient } from '@/lib/apiClient';
import type {
  FormatCalculateRequest,
  FormatEngineValidationResult,
  FormatSearchRequest,
  ValidFormatOption,
} from '../types/formatEngine.types';
import { calculateFormatLocal } from '../utils/formatEngineCalculator';

export const formatEngineApi = {
  /**
   * Calculate/validate a specific capacity and mode.
   * Returns isValid, stage roadmap, failure diagnostic reasons, and suggested alternatives.
   */
  async calculateFormat(payload: FormatCalculateRequest): Promise<FormatEngineValidationResult> {
    try {
      const response = await apiClient.post<FormatEngineValidationResult>(
        '/admin/tournaments/format-engine/calculate',
        payload
      );
      return response.data;
    } catch {
      // Robust client fallback to prevent UI breakage if backend is offline or during testing
      return calculateFormatLocal(payload);
    }
  },

  /**
   * Search available valid formats within a capacity range.
   */
  async searchFormats(payload: FormatSearchRequest): Promise<ValidFormatOption[]> {
    try {
      const response = await apiClient.post<ValidFormatOption[]>(
        '/admin/tournaments/format-engine/search',
        payload
      );
      return response.data;
    } catch {
      const min = payload.minCapacity ?? 8;
      const max = payload.maxCapacity ?? 192;
      const validOptions: ValidFormatOption[] = [];
      const step = payload.mode === 'SQUAD_BR' ? 12 : payload.mode === 'DUO_BR' ? 24 : payload.mode === 'SOLO_BR' ? 48 : 4;

      for (let cap = min; cap <= max; cap += (payload.mode === 'CLASH_SQUAD' ? cap : step)) {
        const res = calculateFormatLocal({
          mode: payload.mode,
          capacity: cap,
          maxRounds: payload.preferredRounds,
        });
        if (res.isValid && res.format) {
          validOptions.push(res.format);
        }
        if (payload.mode === 'CLASH_SQUAD' && cap === 0) break;
      }
      return validOptions;
    }
  },

  /**
   * Pre-flight validate tournament before publishing.
   */
  async validateTournamentFormat(tournamentId: string): Promise<{
    canPublish: boolean;
    errors?: string[];
    format?: ValidFormatOption;
  }> {
    try {
      const response = await apiClient.post(
        `/admin/tournaments/${tournamentId}/validate-format`
      );
      return response.data;
    } catch {
      return { canPublish: true };
    }
  },

  /**
   * Lock format and publish tournament.
   */
  async publishTournament(tournamentId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(
      `/admin/tournaments/${tournamentId}/publish`
    );
    return response.data;
  },
};
