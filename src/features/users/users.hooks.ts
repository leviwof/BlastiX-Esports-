import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/apiError';
import { queryKeys } from '@/lib/queryKeys';
import { getUser, listUsers, updateUser } from './users.api';
import type { ListUsersQuery, UpdateUserPayload } from './users.types';

/**
 * TanStack Query hooks for user management. The list is cached per-filter and
 * keeps the previous page visible while paging; the update mutation invalidates
 * both the detail key and the whole `['users']` list surface so every view
 * reflects a ban / role change immediately.
 */

const onMutationError = (error: unknown) => toast.error(getErrorMessage(error));

export function useUsers(query: ListUsersQuery = {}) {
  return useQuery({
    queryKey: queryKeys.users(query as Record<string, unknown>),
    queryFn: () => listUsers(query),
    placeholderData: (prev) => prev,
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.user(id ?? ''),
    queryFn: () => getUser(id as string),
    enabled: Boolean(id),
  });
}

/** PATCH /admin/users/:id — ban / unban or change role. */
export function useUpdateUser(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateUserPayload) => updateUser(id, body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.user(id) });
      void client.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated');
    },
    onError: onMutationError,
  });
}
