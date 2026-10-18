import type { components, operations } from '../contracts/generated/academic-management.js';
import type { KnowledgeNetwork, Page } from './trainingProgram.js';

export type { KnowledgeNetwork, Page };

export type TechLine = components['schemas']['TechLine'];
export type TechLineCreate = components['schemas']['TechLineCreate'];
export type TechLineUpdate = components['schemas']['TechLineUpdate'];
export type TechNetwork = components['schemas']['TechNetwork'];
export type TechNetworkCreate = components['schemas']['TechNetworkCreate'];
export type TechNetworkUpdate = components['schemas']['TechNetworkUpdate'];
export type KnowledgeNetworkCreate = components['schemas']['KnowledgeNetworkCreate'];
export type KnowledgeNetworkUpdate = components['schemas']['KnowledgeNetworkUpdate'];

export type ListTechLinesQuery = NonNullable<operations['listTechLines']['parameters']['query']>;
export type ListTechNetworksQuery = NonNullable<operations['listTechNetworks']['parameters']['query']>;
export type ListKnowledgeNetworksQuery = NonNullable<
  operations['listKnowledgeNetworks']['parameters']['query']
>;

// E4: niveles de la jerarquía curricular.
export type CurriculumLevel = 'TECH_LINE' | 'TECH_NETWORK' | 'KNOWLEDGE_NETWORK';

export const LEVEL_LABELS: Record<CurriculumLevel, string> = {
  TECH_LINE: 'línea tecnológica',
  TECH_NETWORK: 'red tecnológica',
  KNOWLEDGE_NETWORK: 'red de conocimiento',
};

export const LEVEL_PLURALS: Record<CurriculumLevel, string> = {
  TECH_LINE: 'líneas tecnológicas',
  TECH_NETWORK: 'redes tecnológicas',
  KNOWLEDGE_NETWORK: 'redes de conocimiento',
};

export const NAME_MAX_LENGTH = 150;
export const CODE_MAX_LENGTH = 20;

// ---------- Formulario común a los tres niveles (E1, E2, E3) ----------

export interface CatalogFormValues {
  parent_id: string; // vacío en líneas tecnológicas (no tienen padre)
  name: string;
  code: string;
  is_active: boolean;
}

export type CatalogFormErrors = Partial<Record<'parent_id' | 'name' | 'code', string>>;

export const EMPTY_CATALOG_FORM: CatalogFormValues = { parent_id: '', name: '', code: '', is_active: true };

// parentRequiredMessage: si se informa, el padre es obligatorio (redes tecnológicas y de conocimiento).
export function validateCatalogForm(values: CatalogFormValues, parentRequiredMessage?: string): CatalogFormErrors {
  const errors: CatalogFormErrors = {};
  const name = values.name.trim();
  const code = values.code.trim();

  if (parentRequiredMessage && !values.parent_id) errors.parent_id = parentRequiredMessage;

  if (!name) errors.name = 'El nombre es obligatorio.';
  else if (name.length > NAME_MAX_LENGTH) errors.name = `El nombre no puede superar ${NAME_MAX_LENGTH} caracteres.`;

  if (!code) errors.code = 'El código es obligatorio.';
  else if (code.length > CODE_MAX_LENGTH) errors.code = `El código no puede superar ${CODE_MAX_LENGTH} caracteres.`;

  return errors;
}

export function catalogToFormValues(
  item: { name: string; code: string; is_active: boolean },
  parentId = '',
): CatalogFormValues {
  return { parent_id: parentId, name: item.name, code: item.code, is_active: item.is_active };
}

// Se asume que los valores ya pasaron validateCatalogForm.
export function toTechLineCreate(values: CatalogFormValues): TechLineCreate {
  return { name: values.name.trim(), code: values.code.trim(), is_active: values.is_active };
}

export function toTechLineUpdate(values: CatalogFormValues): TechLineUpdate {
  return { name: values.name.trim(), code: values.code.trim(), is_active: values.is_active };
}

export function toTechNetworkCreate(values: CatalogFormValues): TechNetworkCreate {
  return {
    tech_line_id: values.parent_id,
    name: values.name.trim(),
    code: values.code.trim(),
    is_active: values.is_active,
  };
}

export function toTechNetworkUpdate(values: CatalogFormValues): TechNetworkUpdate {
  return {
    tech_line_id: values.parent_id,
    name: values.name.trim(),
    code: values.code.trim(),
    is_active: values.is_active,
  };
}

export function toKnowledgeNetworkCreate(values: CatalogFormValues): KnowledgeNetworkCreate {
  return {
    tech_network_id: values.parent_id,
    name: values.name.trim(),
    code: values.code.trim(),
    is_active: values.is_active,
  };
}

export function toKnowledgeNetworkUpdate(values: CatalogFormValues): KnowledgeNetworkUpdate {
  return {
    tech_network_id: values.parent_id,
    name: values.name.trim(),
    code: values.code.trim(),
    is_active: values.is_active,
  };
}
