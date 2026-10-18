import { afterEach, describe, expect, it, vi } from 'vitest';

import { HttpTrainingProgramsApi } from '../../src/adapter/out/http/HttpTrainingProgramsApi.js';
import { competenciesPage, outcomesPage, program, programsPage } from '../fixturesPrograms.js';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const stubFetch = (response: Response) => {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('HttpTrainingProgramsApi', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('E1: traduce paginación y filtros a query params de GET /training-programs', async () => {
    const fetchMock = stubFetch(json(programsPage));
    const api = new HttpTrainingProgramsApi('/api/v1/');

    await api.list({ page: 2, page_size: 20, is_active: true, training_level: 'TECHNICIAN', program_code: '' });

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain('/api/v1/training-programs?');
    expect(url).toContain('page=2');
    expect(url).toContain('page_size=20');
    expect(url).toContain('is_active=true');
    expect(url).toContain('training_level=TECHNICIAN');
    expect(url).not.toContain('program_code');
  });

  it('E1: crea con POST y cuerpo JSON', async () => {
    const fetchMock = stubFetch(json(program, 201));
    const api = new HttpTrainingProgramsApi();
    const body = {
      knowledge_network_id: program.knowledge_network_id,
      program_code: '1',
      name: 'N',
      training_level: 'OPERATOR' as const,
      total_hours: 10,
      is_active: true,
    };

    await expect(api.create(body)).resolves.toEqual(program);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('/api/v1/training-programs');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toEqual(body);
  });

  it('E2: actualiza con PUT /training-programs/{id}', async () => {
    const fetchMock = stubFetch(json({ ...program, version: 4 }));
    const api = new HttpTrainingProgramsApi();

    await api.update(program.id, { name: 'Otro', version: 4 });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(`/api/v1/training-programs/${program.id}`);
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body)).toEqual({ name: 'Otro', version: 4 });
  });

  it('E5: da de baja con DELETE y acepta 204 sin cuerpo', async () => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }));
    const api = new HttpTrainingProgramsApi();

    await expect(api.deactivate(program.id)).resolves.toBeUndefined();

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(`/api/v1/training-programs/${program.id}`);
    expect(init.method).toBe('DELETE');
    expect(init.body).toBeUndefined();
  });

  it('E3: lista y crea competencias bajo el programa', async () => {
    const fetchMock = stubFetch(json(competenciesPage));
    const api = new HttpTrainingProgramsApi();

    await api.listCompetencies(program.id, { page: 1, page_size: 50 });
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      `/api/v1/training-programs/${program.id}/competencies?page=1&page_size=50`,
    );

    fetchMock.mockResolvedValueOnce(json(competenciesPage.data[0], 201));
    await api.createCompetency(program.id, { name: 'C', sena_code: '1', hours: 10, is_active: true });
    expect(fetchMock.mock.calls[1][1].method).toBe('POST');
  });

  it('E4: lista los RAP de una competencia', async () => {
    const fetchMock = stubFetch(json(outcomesPage));
    const api = new HttpTrainingProgramsApi();

    await api.listLearningOutcomes('comp-1', { page: 1 });

    expect(String(fetchMock.mock.calls[0][0])).toBe('/api/v1/competencies/comp-1/learning-outcomes?page=1');
  });

  it('usa el mensaje del contrato cuando la API responde con error', async () => {
    stubFetch(json({ error: { code: 'CONFLICT', message: 'El código ya existe.' } }, 409));
    const api = new HttpTrainingProgramsApi();

    await expect(api.deactivate(program.id)).rejects.toThrow('El código ya existe.');
  });

  it('usa un mensaje genérico si el error no trae cuerpo JSON', async () => {
    stubFetch(new Response('boom', { status: 500 }));
    const api = new HttpTrainingProgramsApi();

    await expect(api.list({})).rejects.toThrow('HTTP 500');
  });
});