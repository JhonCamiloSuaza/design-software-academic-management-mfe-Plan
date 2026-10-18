import type { components, operations } from '../contracts/generated/academic-management.js';

export type ContractFicha = components['schemas']['Ficha'];
export type Pagination = components['schemas']['Pagination'];
export type ListFichasQuery = NonNullable<operations['listFichas']['parameters']['query']>;

// El contrato declara un enum, pero la BD aún no lo garantiza. La frontera HTTP
// mantiene status como string para que un valor nuevo nunca rompa el render.
export type Ficha = Omit<ContractFicha, 'status'> & { status: string };

export interface FichasPageResult {
  data: Ficha[];
  pagination: Pagination;
}

export type FichaStatus = ContractFicha['status'];

export const FICHA_STATUSES: readonly FichaStatus[] = [
  'INDUCTION',
  'EXECUTION',
  'PRODUCTIVE_STAGE',
  'COMPLETED',
  'CANCELLED',
];

export interface StatusPresentation {
  label: string;
  tone: 'info' | 'success' | 'warning' | 'neutral' | 'danger';
  symbol: string;
  known: boolean;
}

const STATUS_PRESENTATION: Record<FichaStatus, Omit<StatusPresentation, 'known'>> = {
  INDUCTION: { label: 'Inducción', tone: 'info', symbol: '●' },
  EXECUTION: { label: 'Ejecución', tone: 'success', symbol: '●' },
  PRODUCTIVE_STAGE: { label: 'Etapa productiva', tone: 'warning', symbol: '◆' },
  COMPLETED: { label: 'Finalizada', tone: 'neutral', symbol: '✓' },
  CANCELLED: { label: 'Cancelada', tone: 'danger', symbol: '×' },
};

export function isFichaStatus(value: string): value is FichaStatus {
  return FICHA_STATUSES.some((status) => status === value);
}

export function getFichaStatusPresentation(status: string): StatusPresentation {
  if (!isFichaStatus(status)) {
    return { label: 'Estado desconocido', tone: 'neutral', symbol: '?', known: false };
  }

  return { ...STATUS_PRESENTATION[status], known: true };
}

export const SHIFT_LABELS: Record<ContractFicha['training_shift'], string> = {
  DAY: 'Diurna',
  NIGHT: 'Nocturna',
  MIXED: 'Mixta',
};

export const MODALITY_LABELS: Record<ContractFicha['training_modality'], string> = {
  IN_PERSON: 'Presencial',
  VIRTUAL: 'Virtual',
  HYBRID: 'Híbrida',
};
