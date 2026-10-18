import { describe, expect, it } from 'vitest';

import {
  EMPTY_CATALOG_FORM,
  catalogToFormValues,
  toKnowledgeNetworkCreate,
  toTechLineCreate,
  toTechLineUpdate,
  toTechNetworkCreate,
  toTechNetworkUpdate,
  validateCatalogForm,
} from '../../src/domain/curriculum.js';
import { techNetwork } from '../fixturesCurriculum.js';

describe('curriculum (dominio)', () => {
  it('E1: valida nombre y código obligatorios', () => {
    expect(Object.keys(validateCatalogForm(EMPTY_CATALOG_FORM)).sort()).toEqual(['code', 'name']);
  });

  it('E2/E3: exige el padre solo cuando se informa el mensaje', () => {
    const values = { parent_id: '', name: 'N', code: 'C', is_active: true };
    expect(validateCatalogForm(values)).toEqual({});
    expect(validateCatalogForm(values, 'Selecciona una línea tecnológica.').parent_id).toBe(
      'Selecciona una línea tecnológica.',
    );
  });

  it('valida longitudes máximas del contrato', () => {
    const errors = validateCatalogForm({ parent_id: '', name: 'x'.repeat(151), code: 'y'.repeat(21), is_active: true });
    expect(errors.name).toBeDefined();
    expect(errors.code).toBeDefined();
  });

  it('E1: arma los cuerpos de la línea con el estado del formulario', () => {
    const values = { parent_id: '', name: '  Línea ', code: ' L1 ', is_active: true };
    expect(toTechLineCreate(values)).toEqual({ name: 'Línea', code: 'L1', is_active: true });
    expect(toTechLineUpdate({ ...values, is_active: false })).toEqual({ name: 'Línea', code: 'L1', is_active: false });
  });

  it('E2: la red tecnológica lleva la línea seleccionada', () => {
    const values = catalogToFormValues(techNetwork, techNetwork.tech_line_id);
    expect(toTechNetworkCreate(values)).toEqual({
      tech_line_id: techNetwork.tech_line_id,
      name: techNetwork.name,
      code: techNetwork.code,
      is_active: true,
    });
    expect(toTechNetworkUpdate(values).tech_line_id).toBe(techNetwork.tech_line_id);
  });

  it('E3: la red de conocimiento lleva la red tecnológica seleccionada', () => {
    expect(toKnowledgeNetworkCreate({ parent_id: 'tn-1', name: 'N', code: 'C', is_active: true })).toEqual({
      tech_network_id: 'tn-1',
      name: 'N',
      code: 'C',
      is_active: true,
    });
  });
});
