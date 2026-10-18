import { vi } from 'vitest';

import type { TrainingProgramsApi } from '../src/application/ports/TrainingProgramsApi.js';
import {
  competenciesPage,
  competency,
  knowledgeNetworksPage,
  outcomesPage,
  program,
  programsPage,
} from './fixturesPrograms.js';

export const createProgramsApi = (overrides: Partial<TrainingProgramsApi> = {}): TrainingProgramsApi => ({
  list: vi.fn().mockResolvedValue(programsPage),
  create: vi.fn().mockResolvedValue(program),
  getById: vi.fn().mockResolvedValue(program),
  update: vi.fn().mockResolvedValue({ ...program, version: program.version + 1 }),
  deactivate: vi.fn().mockResolvedValue(undefined),
  listCompetencies: vi.fn().mockResolvedValue(competenciesPage),
  createCompetency: vi.fn().mockResolvedValue(competency),
  listLearningOutcomes: vi.fn().mockResolvedValue(outcomesPage),
  listKnowledgeNetworks: vi.fn().mockResolvedValue(knowledgeNetworksPage),
  ...overrides,
});