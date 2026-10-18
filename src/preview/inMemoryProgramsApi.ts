// API simulada en memoria para la vista previa de ProgramsPage (HU-ACAD-17).
// NO llama al backend: todo vive en este modulo y se pierde al recargar la pagina.
import type { TrainingProgramsApi } from '../application/ports/TrainingProgramsApi.js';
import type {
  Competency,
  KnowledgeNetwork,
  LearningOutcome,
  Page,
  TrainingProgram,
} from '../domain/trainingProgram.js';

export type PreviewState = 'ok' | 'slow' | 'empty' | 'error';
export type WritesState = 'ok' | 'error';

export interface PreviewScenario {
  /** Listado de programas. */
  list: PreviewState;
  /** Arbol: competencias y resultados de aprendizaje. */
  tree: PreviewState;
  /** Crear, editar y dar de baja. */
  writes: WritesState;
}

export const DEFAULT_SCENARIO: PreviewScenario = { list: 'ok', tree: 'ok', writes: 'ok' };

export interface PreviewOptions {
  scenario?: Partial<PreviewScenario>;
  /** Latencia simulada de cada llamada (ms). */
  latencyMs?: number;
  /** Latencia del estado "cargando" (ms), suficiente para revisarlo con calma. */
  slowMs?: number;
  /** Tamano de pagina si la consulta no lo indica. */
  pageSize?: number;
}

export const READ_ERROR_MESSAGE = 'No fue posible conectar con el servicio (error simulado).';
export const WRITE_ERROR_MESSAGE = 'El servidor rechazó la operación (error simulado).';

// ------------------------------------------------------------------ datos de ejemplo (ficticios)

const BASE_DATE = '2026-01-15T10:00:00Z';
const UPDATED_DATE = '2026-08-06T14:30:00Z';

const id = (kind: number, n: number): string =>
  `${String(kind).padStart(8, '0')}-0000-4000-8000-${String(n).padStart(12, '0')}`;

const NETWORKS: KnowledgeNetwork[] = [
  { id: id(4, 1), tech_network_id: id(5, 1), name: 'Informática, diseño y desarrollo de software', code: 'RC-INF', is_active: true, created_at: BASE_DATE },
  { id: id(4, 2), tech_network_id: id(5, 1), name: 'Gestión administrativa y financiera', code: 'RC-ADM', is_active: true, created_at: BASE_DATE },
  { id: id(4, 3), tech_network_id: id(5, 2), name: 'Electricidad y electrónica', code: 'RC-ELE', is_active: true, created_at: BASE_DATE },
];

interface ProgramSeed {
  code: string;
  name: string;
  level: TrainingProgram['training_level'];
  hours: number;
  version: number;
  active: boolean;
  network: number;
}

const PROGRAM_SEEDS: ProgramSeed[] = [
  { code: '228118', name: 'Análisis y desarrollo de software', level: 'TECHNOLOGIST', hours: 2640, version: 3, active: true, network: 0 },
  { code: '228106', name: 'Técnico en programación de software', level: 'TECHNICIAN', hours: 1440, version: 2, active: true, network: 0 },
  { code: '233104', name: 'Gestión empresarial', level: 'TECHNOLOGIST', hours: 2760, version: 1, active: true, network: 1 },
  { code: '133100', name: 'Asistencia administrativa', level: 'TECHNICIAN', hours: 1584, version: 4, active: true, network: 1 },
  { code: '122114', name: 'Contabilización de operaciones comerciales y financieras', level: 'TECHNICIAN', hours: 1584, version: 2, active: true, network: 1 },
  { code: '233121', name: 'Gestión del talento humano', level: 'TECHNOLOGIST', hours: 2640, version: 1, active: false, network: 1 },
  { code: '228185', name: 'Mantenimiento de equipos de cómputo', level: 'TECHNICIAN', hours: 1584, version: 1, active: true, network: 0 },
  { code: '521201', name: 'Electricidad industrial', level: 'TECHNICIAN', hours: 1440, version: 2, active: true, network: 2 },
  { code: '521305', name: 'Mantenimiento electromecánico industrial', level: 'TECHNOLOGIST', hours: 2640, version: 1, active: true, network: 2 },
  { code: '521410', name: 'Instalaciones eléctricas residenciales', level: 'OPERATOR', hours: 400, version: 1, active: true, network: 2 },
  { code: '133220', name: 'Auxiliar administrativo', level: 'AUXILIARY', hours: 800, version: 1, active: false, network: 1 },
  { code: '521520', name: 'Domótica', level: 'TECHNICIAN', hours: 1200, version: 2, active: false, network: 2 },
];

type CompetencySeed = readonly [code: string, name: string, hours: number];

const ADSO_COMPETENCIES: CompetencySeed[] = [
  ['220501092', 'Analizar los requisitos del cliente para construir el sistema de información', 280],
  ['220501093', 'Diseñar el sistema de información según los requisitos del cliente', 360],
  ['220501096', 'Desarrollar la solución de software', 480],
  ['220501097', 'Implantar la solución de software en la entidad', 240],
];

const TRANSVERSAL_COMPETENCIES: CompetencySeed[] = [
  ['240201528', 'Ejercer derechos fundamentales del trabajo en el marco de la Constitución', 40],
  ['240201529', 'Interactuar en el contexto productivo y social con principios éticos', 60],
  ['240201530', 'Aplicar prácticas de protección ambiental, seguridad y salud en el trabajo', 30],
];

const OUTCOME_TEXTS = [
  'Identificar los requisitos del proceso según el referente de formación.',
  'Ejecutar las actividades planeadas siguiendo los protocolos establecidos.',
  'Verificar los resultados obtenidos frente a los criterios de calidad.',
];

/** Programa sin competencias, para revisar el estado vacio del arbol. */
const PROGRAM_WITHOUT_COMPETENCIES = 11;
/** Programa y competencia (posicion) sin RAP, para revisar ese estado vacio. */
const PROGRAM_WITH_COMPETENCY_WITHOUT_OUTCOMES = 1;
const COMPETENCY_WITHOUT_OUTCOMES = 3;

interface Store {
  programs: TrainingProgram[];
  competencies: Competency[];
  outcomes: LearningOutcome[];
}

function seed(): Store {
  const programs: TrainingProgram[] = [];
  const competencies: Competency[] = [];
  const outcomes: LearningOutcome[] = [];
  let competencyCount = 0;
  let outcomeCount = 0;

  PROGRAM_SEEDS.forEach((p, i) => {
    const programId = id(1, i + 1);
    programs.push({
      id: programId,
      knowledge_network_id: NETWORKS[p.network].id,
      program_code: p.code,
      name: p.name,
      training_level: p.level,
      total_hours: p.hours,
      version: p.version,
      is_active: p.active,
      created_at: BASE_DATE,
      updated_at: UPDATED_DATE,
    });
    if (i === PROGRAM_WITHOUT_COMPETENCIES) return;

    const technical: CompetencySeed[] =
      i === 0
        ? ADSO_COMPETENCIES
        : [[`2205${String(i + 1).padStart(2, '0')}001`, `Aplicar los procesos propios de ${p.name.toLowerCase()}`, 320]];

    [...technical, ...TRANSVERSAL_COMPETENCIES].forEach(([code, name, hours], j) => {
      competencyCount += 1;
      const competencyId = id(2, competencyCount);
      competencies.push({
        id: competencyId,
        program_id: programId,
        name,
        sena_code: code,
        hours,
        is_active: true,
        created_at: BASE_DATE,
      });
      if (i === PROGRAM_WITH_COMPETENCY_WITHOUT_OUTCOMES && j === COMPETENCY_WITHOUT_OUTCOMES) return;
      OUTCOME_TEXTS.forEach((description, k) => {
        outcomeCount += 1;
        outcomes.push({
          id: id(3, outcomeCount),
          competency_id: competencyId,
          code: `${code}-0${k + 1}`,
          description,
          is_active: true,
          created_at: BASE_DATE,
        });
      });
    });
  });

  return { programs, competencies, outcomes };
}

// ------------------------------------------------------------------ utilidades

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};

const arg = (args: readonly unknown[], index: number): unknown => args[index];

function readBool(query: Record<string, unknown>, ...keys: string[]): boolean | undefined {
  for (const key of keys) {
    const value = query[key];
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
  }
  return undefined;
}

function readNumber(query: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = Number(query[key]);
    if (query[key] !== undefined && query[key] !== '' && Number.isFinite(value)) return value;
  }
  return undefined;
}

const readString = (query: Record<string, unknown>, key: string): string | undefined => {
  const value = query[key];
  return typeof value === 'string' && value !== '' ? value : undefined;
};

function paginate<T>(items: T[], query: Record<string, unknown>, defaultPageSize: number): Page<T> {
  const pageSize = Math.max(1, readNumber(query, 'page_size', 'pageSize') ?? defaultPageSize);
  const totalItems = items.length;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
  const page = Math.min(Math.max(1, readNumber(query, 'page') ?? 1), Math.max(totalPages, 1));
  return {
    data: items.slice((page - 1) * pageSize, page * pageSize),
    pagination: { page, page_size: pageSize, total_items: totalItems, total_pages: totalPages },
  };
}

// ------------------------------------------------------------------ API simulada

export function createInMemoryProgramsApi(options: PreviewOptions = {}) {
  const latencyMs = options.latencyMs ?? 250;
  const slowMs = options.slowMs ?? 4000;
  const defaultPageSize = options.pageSize ?? 10;
  const scenario: PreviewScenario = { ...DEFAULT_SCENARIO, ...options.scenario };
  let store = seed();

  const read = async (state: PreviewState): Promise<void> => {
    await wait(state === 'slow' ? slowMs : latencyMs);
    if (state === 'error') throw new Error(READ_ERROR_MESSAGE);
  };

  const write = async (): Promise<void> => {
    await wait(latencyMs);
    if (scenario.writes === 'error') throw new Error(WRITE_ERROR_MESSAGE);
  };

  const emptyPage = <T>(query: Record<string, unknown>): Page<T> => paginate<T>([], query, defaultPageSize);

  const api: TrainingProgramsApi = {
    list: async (...args) => {
      const query = asRecord(arg(args, 0));
      await read(scenario.list);
      if (scenario.list === 'empty') return emptyPage<TrainingProgram>(query);

      const isActive = readBool(query, 'is_active', 'isActive');
      const programCode = readString(query, 'program_code');
      const networkId = readString(query, 'knowledge_network_id');
      const level = readString(query, 'training_level');
      const filtered = store.programs.filter(
        (p) =>
          (isActive === undefined || p.is_active === isActive) &&
          (programCode === undefined || p.program_code.includes(programCode)) &&
          (networkId === undefined || p.knowledge_network_id === networkId) &&
          (level === undefined || p.training_level === level),
      );
      return paginate(filtered, query, defaultPageSize);
    },

    getById: async (...args) => {
      const programId = String(arg(args, 0));
      await read(scenario.list);
      const found = store.programs.find((p) => p.id === programId);
      if (!found) throw new Error('El programa no existe.');
      return found;
    },

    create: async (...args) => {
      const body = asRecord(arg(args, 0));
      await write();
      const code = String(body.program_code ?? '');
      if (store.programs.some((p) => p.program_code === code)) {
        throw new Error('Ya existe un programa con ese código.');
      }
      const now = new Date().toISOString();
      const created: TrainingProgram = {
        id: crypto.randomUUID(),
        knowledge_network_id: String(body.knowledge_network_id ?? ''),
        program_code: code,
        name: String(body.name ?? ''),
        training_level: body.training_level as TrainingProgram['training_level'],
        total_hours: Number(body.total_hours ?? 0),
        version: 1,
        is_active: body.is_active !== false,
        created_at: now,
        updated_at: now,
      };
      store.programs = [created, ...store.programs];
      return created;
    },

    update: async (...args) => {
      const programId = String(arg(args, 0));
      const body = asRecord(arg(args, 1));
      await write();
      const current = store.programs.find((p) => p.id === programId);
      if (!current) throw new Error('El programa no existe.');
      const updated: TrainingProgram = {
        ...current,
        knowledge_network_id: body.knowledge_network_id !== undefined ? String(body.knowledge_network_id) : current.knowledge_network_id,
        program_code: body.program_code !== undefined ? String(body.program_code) : current.program_code,
        name: body.name !== undefined ? String(body.name) : current.name,
        training_level: (body.training_level ?? current.training_level) as TrainingProgram['training_level'],
        total_hours: body.total_hours !== undefined ? Number(body.total_hours) : current.total_hours,
        version: body.version !== undefined ? Number(body.version) : current.version + 1,
        updated_at: new Date().toISOString(),
      };
      store.programs = store.programs.map((p) => (p.id === programId ? updated : p));
      return updated;
    },

    deactivate: async (...args) => {
      const programId = String(arg(args, 0));
      await write();
      const current = store.programs.find((p) => p.id === programId);
      if (!current) throw new Error('El programa no existe.');
      store.programs = store.programs.map((p) =>
        p.id === programId ? { ...p, is_active: false, updated_at: new Date().toISOString() } : p,
      );
    },

    listCompetencies: async (...args) => {
      const programId = String(arg(args, 0));
      const query = asRecord(arg(args, 1));
      await read(scenario.tree);
      if (scenario.tree === 'empty') return emptyPage<Competency>(query);
      const isActive = readBool(query, 'is_active', 'isActive');
      const items = store.competencies.filter(
        (c) => c.program_id === programId && (isActive === undefined || c.is_active === isActive),
      );
      return paginate(items, query, defaultPageSize);
    },

    createCompetency: async (...args) => {
      const programId = String(arg(args, 0));
      const body = asRecord(arg(args, 1));
      await write();
      const code = String(body.sena_code ?? '');
      if (store.competencies.some((c) => c.program_id === programId && c.sena_code === code)) {
        throw new Error('Ya existe una competencia con ese código SENA en el programa.');
      }
      const created: Competency = {
        id: crypto.randomUUID(),
        program_id: programId,
        name: String(body.name ?? ''),
        sena_code: code,
        hours: Number(body.hours ?? 0),
        is_active: body.is_active !== false,
        created_at: new Date().toISOString(),
      };
      store.competencies = [...store.competencies, created];
      return created;
    },

    listLearningOutcomes: async (...args) => {
      const competencyId = String(arg(args, 0));
      const query = asRecord(arg(args, 1));
      await read(scenario.tree);
      if (scenario.tree === 'empty') return emptyPage<LearningOutcome>(query);
      const isActive = readBool(query, 'is_active', 'isActive');
      const items = store.outcomes.filter(
        (o) => o.competency_id === competencyId && (isActive === undefined || o.is_active === isActive),
      );
      return paginate(items, query, defaultPageSize);
    },

    listKnowledgeNetworks: async (...args) => {
      const query = asRecord(arg(args, 0));
      await wait(latencyMs);
      return paginate(NETWORKS, query, defaultPageSize);
    },
  };

  return {
    api,
    /** Escenario vigente (se lee en cada llamada). */
    scenario,
    setScenario(patch: Partial<PreviewScenario>): void {
      Object.assign(scenario, patch);
    },
    /** Vuelve a los datos de ejemplo originales. */
    reset(): void {
      store = seed();
    },
  };
}

export type InMemoryPrograms = ReturnType<typeof createInMemoryProgramsApi>;