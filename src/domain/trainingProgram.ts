import type { components, operations } from '../contracts/generated/academic-management.js';

export type ContractTrainingProgram = components['schemas']['TrainingProgram'];
export type TrainingProgramCreate = components['schemas']['TrainingProgramCreate'];
export type TrainingProgramUpdate = components['schemas']['TrainingProgramUpdate'];
export type Competency = components['schemas']['Competency'];
export type CompetencyCreate = components['schemas']['CompetencyCreate'];
export type LearningOutcome = components['schemas']['LearningOutcome'];
export type KnowledgeNetwork = components['schemas']['KnowledgeNetwork'];
export type Pagination = components['schemas']['Pagination'];

export type TrainingLevel = ContractTrainingProgram['training_level'];

// Igual que en fichas: el contrato declara un enum, pero la frontera HTTP lo
// mantiene como string para que un valor nuevo nunca rompa el render.
export type TrainingProgram = Omit<ContractTrainingProgram, 'training_level'> & {
  training_level: string;
};

export interface Page<T> {
  data: T[];
  pagination: Pagination;
}

export type TrainingProgramsPageResult = Page<TrainingProgram>;

export type ListTrainingProgramsQuery = NonNullable<
  operations['listTrainingPrograms']['parameters']['query']
>;
export type ListCompetenciesQuery = NonNullable<
  operations['listProgramCompetencies']['parameters']['query']
>;
export type ListLearningOutcomesQuery = NonNullable<
  operations['listCompetencyLearningOutcomes']['parameters']['query']
>;
export type ListKnowledgeNetworksQuery = NonNullable<
  operations['listKnowledgeNetworks']['parameters']['query']
>;

export const TRAINING_LEVELS: readonly TrainingLevel[] = [
  'AUXILIARY',
  'OPERATOR',
  'TECHNICIAN',
  'TECHNOLOGIST',
];

export const TRAINING_LEVEL_LABELS: Record<TrainingLevel, string> = {
  AUXILIARY: 'Auxiliar',
  OPERATOR: 'Operario',
  TECHNICIAN: 'Técnico',
  TECHNOLOGIST: 'Tecnólogo',
};

export function isTrainingLevel(value: string): value is TrainingLevel {
  return TRAINING_LEVELS.some((level) => level === value);
}

export function getTrainingLevelLabel(level: string): string {
  return isTrainingLevel(level) ? TRAINING_LEVEL_LABELS[level] : 'Nivel desconocido';
}

export interface ActivePresentation {
  label: string;
  tone: 'success' | 'neutral';
  symbol: string;
}

// E5: la baja lógica se muestra como "Inactivo"; el registro nunca se borra.
export function getActivePresentation(isActive: boolean): ActivePresentation {
  return isActive
    ? { label: 'Activo', tone: 'success', symbol: '●' }
    : { label: 'Inactivo', tone: 'neutral', symbol: '○' };
}

// E2: el contrato no tiene "versión archivada". Mientras backend responde,
// solo se permite editar programas activos (la versión vigente).
export function canEditProgram(program: Pick<TrainingProgram, 'is_active'>): boolean {
  return program.is_active;
}

// ---------- Formulario de programa (E1, E2) ----------

export interface ProgramFormValues {
  knowledge_network_id: string;
  program_code: string;
  name: string;
  training_level: TrainingLevel | '';
  total_hours: string;
}

export type ProgramFormErrors = Partial<Record<keyof ProgramFormValues, string>>;

export const EMPTY_PROGRAM_FORM: ProgramFormValues = {
  knowledge_network_id: '',
  program_code: '',
  name: '',
  training_level: '',
  total_hours: '',
};

const isPositiveInteger = (raw: string) => /^\d+$/.test(raw.trim()) && Number(raw) > 0;

export function validateProgramForm(values: ProgramFormValues): ProgramFormErrors {
  const errors: ProgramFormErrors = {};
  if (!values.knowledge_network_id) errors.knowledge_network_id = 'Selecciona una red de conocimiento.';
  if (!values.program_code.trim()) errors.program_code = 'El código del programa es obligatorio.';
  if (!values.name.trim()) errors.name = 'El nombre es obligatorio.';
  if (!values.training_level) errors.training_level = 'Selecciona un nivel de formación.';
  if (!isPositiveInteger(values.total_hours)) errors.total_hours = 'Ingresa las horas como número entero mayor a 0.';
  return errors;
}

export function programToFormValues(program: TrainingProgram): ProgramFormValues {
  return {
    knowledge_network_id: program.knowledge_network_id,
    program_code: program.program_code,
    name: program.name,
    training_level: isTrainingLevel(program.training_level) ? program.training_level : '',
    total_hours: String(program.total_hours),
  };
}

// Se asume que los valores ya pasaron validateProgramForm.
export function toProgramCreate(values: ProgramFormValues): TrainingProgramCreate {
  return {
    knowledge_network_id: values.knowledge_network_id,
    program_code: values.program_code.trim(),
    name: values.name.trim(),
    training_level: values.training_level as TrainingLevel,
    total_hours: Number(values.total_hours),
    is_active: true,
  };
}

// E2: editar sube la versión en 1 (nueva definición curricular vigente).
export function toProgramUpdate(program: TrainingProgram, values: ProgramFormValues): TrainingProgramUpdate {
  return {
    knowledge_network_id: values.knowledge_network_id,
    program_code: values.program_code.trim(),
    name: values.name.trim(),
    training_level: values.training_level as TrainingLevel,
    total_hours: Number(values.total_hours),
    version: program.version + 1,
  };
}

// ---------- Formulario de competencia (E3) ----------

export interface CompetencyFormValues {
  sena_code: string;
  name: string;
  hours: string;
}

export type CompetencyFormErrors = Partial<Record<keyof CompetencyFormValues, string>>;

export const EMPTY_COMPETENCY_FORM: CompetencyFormValues = { sena_code: '', name: '', hours: '' };

export function validateCompetencyForm(values: CompetencyFormValues): CompetencyFormErrors {
  const errors: CompetencyFormErrors = {};
  if (!values.sena_code.trim()) errors.sena_code = 'El código SENA es obligatorio.';
  if (!values.name.trim()) errors.name = 'El nombre es obligatorio.';
  if (!isPositiveInteger(values.hours)) errors.hours = 'Ingresa las horas como número entero mayor a 0.';
  return errors;
}

export function toCompetencyCreate(values: CompetencyFormValues): CompetencyCreate {
  return {
    sena_code: values.sena_code.trim(),
    name: values.name.trim(),
    hours: Number(values.hours),
    is_active: true,
  };
}