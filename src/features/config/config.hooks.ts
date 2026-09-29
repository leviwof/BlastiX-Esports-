import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/apiError';
import { queryKeys } from '@/lib/queryKeys';
import { getConfig, updateConfig } from './config.api';
import type { UpdateConfigPayload } from './config.types';

/** Read + update app configuration. The mutation invalidates the config key so
 * the maintenance banner / version gate reflect the change immediately. */

export function useConfig() {
  return useQuery({
    queryKey: queryKeys.config,
    queryFn: getConfig,
  });
}

export function useUpdateConfig() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateConfigPayload) => updateConfig(body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.config });
      toast.success('Settings saved');
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });
}
