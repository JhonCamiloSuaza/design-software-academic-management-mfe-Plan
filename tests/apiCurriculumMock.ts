import { vi } from 'vitest';

import type { CurriculumApi } from '../src/application/ports/CurriculumApi.js';
import {
  knowledgeNetwork,
  knowledgeNetworksPage,
  techLine,
  techLinesPage,
  techNetwork,
  techNetworksPage,
} from './fixturesCurriculum.js';

export const createCurriculumApi = (overrides: Partial<CurriculumApi> = {}): CurriculumApi => ({
  listTechLines: vi.fn().mockResolvedValue(techLinesPage),
  createTechLine: vi.fn().mockResolvedValue(techLine),
  updateTechLine: vi.fn().mockResolvedValue(techLine),
  deactivateTechLine: vi.fn().mockResolvedValue(undefined),
  listTechNetworks: vi.fn().mockResolvedValue(techNetworksPage),
  createTechNetwork: vi.fn().mockResolvedValue(techNetwork),
  updateTechNetwork: vi.fn().mockResolvedValue(techNetwork),
  deactivateTechNetwork: vi.fn().mockResolvedValue(undefined),
  listKnowledgeNetworks: vi.fn().mockResolvedValue(knowledgeNetworksPage),
  createKnowledgeNetwork: vi.fn().mockResolvedValue(knowledgeNetwork),
  updateKnowledgeNetwork: vi.fn().mockResolvedValue(knowledgeNetwork),
  deactivateKnowledgeNetwork: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});
