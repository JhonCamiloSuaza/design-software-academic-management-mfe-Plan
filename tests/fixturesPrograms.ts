import type {
  Competency,
  KnowledgeNetwork,
  LearningOutcome,
  Page,
  TrainingProgram,
} from '../src/domain/trainingProgram.js';

export const knowledgeNetwork: KnowledgeNetwork = {
  id: '44444444-4444-4444-8444-444444444444',
  tech_network_id: '55555555-5555-4555-8555-555555555555',
  name: 'Informática, diseño y desarrollo de software',
  code: 'RC-INF',
  is_active: true,
  created_at: '2026-01-01T10:00:00Z',
};

export const program: TrainingProgram = {
  id: '22222222-2222-4222-8222-222222222222',
  knowledge_network_id: knowledgeNetwork.id,
  program_code: '228118',
  name: 'Análisis y desarrollo de software',
  training_level: 'TECHNOLOGIST',
  total_hours: 2640,
  version: 3,
  is_active: true,
  created_at: '2026-01-02T10:00:00Z',
  updated_at: '2026-08-06T14:30:00Z',
};

export const inactiveProgram: TrainingProgram = {
  ...program,
  id: '66666666-6666-4666-8666-666666666666',
  program_code: '999001',
  name: 'Programa dado de baja',
  is_active: false,
};

export const competency: Competency = {
  id: '77777777-7777-4777-8777-777777777777',
  program_id: program.id,
  name: 'Desarrollar la solución de software',
  sena_code: '220501096',
  hours: 480,
  is_active: true,
  created_at: '2026-01-03T10:00:00Z',
};

export const learningOutcome: LearningOutcome = {
  id: '88888888-8888-4888-8888-888888888888',
  competency_id: competency.id,
  code: '220501096-01',
  description: 'Codificar los módulos del software según el diseño.',
  is_active: true,
  created_at: '2026-01-04T10:00:00Z',
};

export const pageOf = <T>(data: T[]): Page<T> => ({
  data,
  pagination: { page: 1, page_size: 10, total_items: data.length, total_pages: data.length ? 1 : 0 },
});

export const programsPage = pageOf([program, inactiveProgram]);
export const competenciesPage = pageOf([competency]);
export const outcomesPage = pageOf([learningOutcome]);
export const knowledgeNetworksPage = pageOf([knowledgeNetwork]);