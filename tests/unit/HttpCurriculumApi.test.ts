import { afterEach, describe, expect, it, vi } from 'vitest';

import { HttpCurriculumApi } from '../../src/adapter/out/http/HttpCurriculumApi.js';
import { techLine, techLinesPage } from '../fixturesCurriculum.js';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const stubFetch = (response: Response) => {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('HttpCurriculumApi', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('E1: lista líneas con paginación y filtro is_active', async () => {
    const fetchMock = stubFetch(json(techLinesPage));
    const api = new HttpCurriculumApi('/api/v1/');

    await api.listTechLines({ page: 1, page_size: 100, is_active: true });

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('/api/v1/tech-lines?');
    expect(url).toContain('page_size=100');
    expect(url).toContain('is_active=true');
  });

  it('E1: crea con POST y edita con PUT', async () => {
    const fetchMock = stubFetch(json(techLine, 201));
    const api = new HttpCurriculumApi();

    await api.createTechLine({ name: 'N', code: 'C', is_active: true });
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
    expect(String(fetchMock.mock.calls[0][0])).toBe('/api/v1/tech-lines');

    fetchMock.mockResolvedValueOnce(json(techLine));
    await api.updateTechLine(techLine.id, { name: 'Otro' });
    expect(fetchMock.mock.calls[1][1].method).toBe('PUT');
    expect(String(fetchMock.mock.calls[1][0])).toBe(`/api/v1/tech-lines/${techLine.id}`);
  });

  it('E2: filtra las redes tecnológicas por línea', async () => {
    const fetchMock = stubFetch(json(techLinesPage));
    const api = new HttpCurriculumApi();

    await api.listTechNetworks({ page: 1, tech_line_id: techLine.id });

    expect(String(fetchMock.mock.calls[0][0])).toContain(`tech_line_id=${techLine.id}`);
  });

  it('E3: filtra las redes de conocimiento por red tecnológica', async () => {
    const fetchMock = stubFetch(json(techLinesPage));
    const api = new HttpCurriculumApi();

    await api.listKnowledgeNetworks({ page: 1, tech_network_id: 'tn-1' });

    expect(String(fetchMock.mock.calls[0][0])).toContain('tech_network_id=tn-1');
  });

  it('E5: da de baja con DELETE y acepta 204', async () => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }));
    const api = new HttpCurriculumApi();

    await expect(api.deactivateTechNetwork('tn-1')).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
    expect(String(fetchMock.mock.calls[0][0])).toBe('/api/v1/tech-networks/tn-1');
  });

  it('E5: propaga el mensaje de conflicto del backend', async () => {
    stubFetch(json({ error: { code: 'CONFLICT', message: 'Hay programas activos que dependen de este nivel.' } }, 409));
    const api = new HttpCurriculumApi();

    await expect(api.deactivateTechLine(techLine.id)).rejects.toThrow(
      'Hay programas activos que dependen de este nivel.',
    );
  });
});
