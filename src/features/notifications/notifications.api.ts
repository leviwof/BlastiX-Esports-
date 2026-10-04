import { apiClient } from '@/lib/apiClient';

export interface BroadcastNotificationPayload {
  title: string;
  body: string;
}

export interface BroadcastNotificationResult {
  targeted: number;
  sent: number;
  failed: number;
}

export async function sendBroadcastNotification(
  payload: BroadcastNotificationPayload,
): Promise<BroadcastNotificationResult> {
  const response = await apiClient.post<BroadcastNotificationResult>(
    '/admin/notifications/broadcast',
    payload,
  );
  return response.data;
}
