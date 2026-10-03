import { apiClient } from './apiClient';

export async function uploadAdminImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<{ image_url: string }>('/admin/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return response.data.image_url;
}
