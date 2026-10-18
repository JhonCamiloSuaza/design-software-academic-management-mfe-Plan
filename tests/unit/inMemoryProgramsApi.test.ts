import { describe, expect, it } from 'vitest';

import {
  createInMemoryProgramsApi,
  READ_ERROR_MESSAGE,
  WRITE_ERROR_MESSAGE,
  type InMemoryPrograms,
} from '../../src/preview/inMemoryProgramsApi.js';
import type {
  Competency,
  LearningOutcome,
  Page,
  TrainingProgram,
} from '../../src/domain/trainingProgram.js';

// Vista "suelta" del puerto: las pruebas no dependen de la forma exacta de los parametros.
interface LooseApi {
  list(query?: Record<string, unknown>): Promise<Page<TrainingProgram>>;
  create(body: Record<string, unknown>): Promise<TrainingProgram>;
  update(id: string, body: Record<string, unknown>): Promise<TrainingProgram>;
  deactivate(id: string): Promise<void>;
  listCompetencies(programId: string, query?: Record<string, unknown>): Promise<Page<Competency>>;
  listLearningOutcomes(competencyId: string, query?: Record<string, unknown>): Promise<Page<LearningOutcome>>;
}

const make = (options: Parameters<typeof createInMemoryProgramsApi>[0] = {}) => {
  const preview: InMemoryPrograms = createInMemoryProgramsApi({ latencyMs: 0, slowMs: 0, ...options });
  return { preview, api: preview.api as unknown as LooseApi };
};

const newProgram = {
  knowledge_network_id: '00000004-0000-4000-8000-000000000001',
  program_code: '777001',
  name: 'Programa nuevo de prueba',
  training_level: 'TECHNICIAN',
  total_hours: 1000,
};

describe('API simulada de programas (vista previa)', () => {
  it('pagina el listado: 12 programas en 2 paginas de 10', async () => {
    const { api } = make();
    const first = await api.list({ page: 1, page_size: 10 });
    const second = await api.list({ page: 2, page_size: 10 });

    expect(first.data).toHaveLength(10);
    expect(first.pagination).toEqual({ page: 1, page_size: 10, total_items: 12, total_pages: 2 });
    expect(second.data).toHaveLength(2);
  });

  it('filtra por estado en el "servidor" simulado', async () => {
    const { api } = make();
    const inactive = await api.list({ is_active: false });
    const active = await api.list({ is_active: true, page_size: 100 });

    expect(inactive.data).toHaveLength(3);
    expect(inactive.data.every((p) => !p.is_active)).toBe(true);
    expect(active.data).toHaveLength(9);
  });

  it('escenario "sin resultados" devuelve lista vacia', async () => {
    const { api } = make({ scenario: { list: 'empty' } });
    const result = await api.list({ page: 1 });

    expect(result.data).toEqual([]);
    expect(result.pagination.total_items).toBe(0);
  });

  it('escenario "error" rechaza la consulta', async () => {
    const { api } = make({ scenario: { list: 'error' } });
    await expect(api.list({})).rejects.toThrow(READ_ERROR_MESSAGE);
  });

  it('crea un programa en version 1 y rechaza codigos repetidos', async () => {
    const { api } = make();
    const created = await api.create(newProgram);

    expect(created.version).toBe(1);
    expect(created.is_active).toBe(true);
    expect((await api.list({ page_size: 100 })).data[0].id).toBe(created.id);
    await expect(api.create(newProgram)).rejects.toThrow('Ya existe un programa con ese código.');
  });

  it('edita un programa respetando la version enviada', async () => {
    const { api } = make();
    const [first] = (await api.list({})).data;
    const updated = await api.update(first.id, { name: 'Nombre editado', version: first.version + 1 });

    expect(updated.name).toBe('Nombre editado');
    expect(updated.version).toBe(first.version + 1);
  });

  it('da de baja sin borrar y "Restablecer datos" vuelve al estado inicial', async () => {
    const { api, preview } = make();
    const [first] = (await api.list({})).data;
    await api.deactivate(first.id);

    const afterDeactivate = await api.list({ page_size: 100 });
    expect(afterDeactivate.pagination.total_items).toBe(12);
    expect(afterDeactivate.data.find((p) => p.id === first.id)?.is_active).toBe(false);

    preview.reset();
    const afterReset = await api.list({ page_size: 100 });
    expect(afterReset.data.find((p) => p.id === first.id)?.is_active).toBe(true);
  });

  it('las escrituras fallan sin modificar los datos cuando el escenario lo pide', async () => {
    const { api, preview } = make({ scenario: { writes: 'error' } });
    await expect(api.create(newProgram)).rejects.toThrow(WRITE_ERROR_MESSAGE);

    preview.setScenario({ writes: 'ok' });
    expect((await api.list({ page_size: 100 })).pagination.total_items).toBe(12);
  });

  it('arbol: competencias, RAP y los estados vacios de ejemplo', async () => {
    const { api } = make();
    const programs = (await api.list({ page_size: 100 })).data;
    const adso = programs.find((p) => p.program_code === '228118');
    const withoutCompetencies = programs.find((p) => p.program_code === '521520');
    const withEmptyCompetency = programs.find((p) => p.program_code === '228106');

    const competencies = await api.listCompetencies(adso!.id, {});
    expect(competencies.data).toHaveLength(7);
    expect((await api.listLearningOutcomes(competencies.data[0].id, {})).data).toHaveLength(3);

    expect((await api.listCompetencies(withoutCompetencies!.id, {})).data).toEqual([]);

    const empties = (await api.listCompetencies(withEmptyCompetency!.id, {})).data;
    expect((await api.listLearningOutcomes(empties[3].id, {})).data).toEqual([]);
  });

  it('escenario de arbol en error rechaza competencias y RAP', async () => {
    const { api } = make({ scenario: { tree: 'error' } });
    const [first] = (await api.list({})).data;
    await expect(api.listCompetencies(first.id, {})).rejects.toThrow(READ_ERROR_MESSAGE);
  });
});