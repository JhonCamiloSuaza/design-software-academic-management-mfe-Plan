import { afterEach, describe, expect, it, vi } from 'vitest';

import { HttpFichasApi } from '../../src/adapter/out/http/HttpFichasApi.js';
import { page } from '../fixtures.js';

describe('HttpFichasApi', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('traduce paginación y filtros a query params de GET /fichas', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(page), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);
    const api = new HttpFichasApi('/api/v1/');

    await api.list({ page: 2, page_size: 20, program_id: 'program-1', status: 'EXECUTION' });

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('/api/v1/fichas?');
    expect(url).toContain('page=2');
    expect(url).toContain('page_size=20');
    expect(url).toContain('program_id=program-1');
    expect(url).toContain('status=EXECUTION');
  });
});
