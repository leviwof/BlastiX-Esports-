import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/apiError';
import { queryKeys } from '@/lib/queryKeys';
import { getUser, listUsers, notifyIosUsers, notifySingleIosUser, updateUser } from './users.api';
import type { ListUsersQuery, NotifyIosUsersPayload, UpdateUserPayload } from './users.types';

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

/** Bulk notify iOS waitlist users when iPhone support goes live. */
export function useNotifyIosUsers() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: NotifyIosUsersPayload = {}) => notifyIosUsers(payload),
    onSuccess: (data) => {
      void client.invalidateQueries({ queryKey: ['users'] });
      toast.success(data.message || `Notified ${data.notified_count} iOS user(s) successfully!`);
    },
    onError: onMutationError,
  });
}

/** Notify an individual iOS user. */
export function useNotifySingleIosUser(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => notifySingleIosUser(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.user(id) });
      void client.invalidateQueries({ queryKey: ['users'] });
      toast.success('iOS launch notification sent to user.');
    },
    onError: onMutationError,
  });
}
