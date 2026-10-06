import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/lib/apiClient';
import { createBanner } from './content.api';

vi.mock('@/lib/apiClient', () => ({
  apiClient: { post: vi.fn() },
}));

describe('createBanner', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends the banner metadata and image as multipart form data', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { id: 'banner-1', image_url: 'https://cdn.example.com/banner.png' },
    } as never);
    const image = new File(['image'], 'banner.png', { type: 'image/png' });

    await expect(
      createBanner(
        {
          title: 'BGC 2026',
          tagline: 'OFFICIAL TOURNAMENT SERIES',
          target_tab_index: 1,
          image_url: 'https://placeholder.local/banner',
          is_active: true,
          sort_order: 2,
        },
        image,
      ),
    ).resolves.toEqual({ id: 'banner-1', image_url: 'https://cdn.example.com/banner.png' });

    const [path, body, config] = vi.mocked(apiClient.post).mock.calls[0];
    expect(path).toBe('/admin/banners');
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('image')).toBe(image);
    expect((body as FormData).get('title')).toBe('BGC 2026');
    expect((body as FormData).get('target_tab_index')).toBe('1');
    expect((body as FormData).get('order')).toBe('2');
    expect((body as FormData).has('sort_order')).toBe(false);
    expect((body as FormData).has('image_url')).toBe(false);
    expect(config).toMatchObject({
      timeout: 60000,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });
});
