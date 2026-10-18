import { describe, expect, it } from 'vitest';

import {
  EMPTY_COMPETENCY_FORM,
  EMPTY_PROGRAM_FORM,
  canEditProgram,
  getActivePresentation,
  getTrainingLevelLabel,
  programToFormValues,
  toCompetencyCreate,
  toProgramCreate,
  toProgramUpdate,
  validateCompetencyForm,
  validateProgramForm,
} from '../../src/domain/trainingProgram.js';
import { inactiveProgram, program } from '../fixturesPrograms.js';

describe('trainingProgram (dominio)', () => {
  it('etiqueta los niveles y tolera uno desconocido', () => {
    expect(getTrainingLevelLabel('TECHNOLOGIST')).toBe('Tecnólogo');
    expect(getTrainingLevelLabel('NUEVO')).toBe('Nivel desconocido');
  });

  it('E5: presenta activo e inactivo', () => {
    expect(getActivePresentation(true).label).toBe('Activo');
    expect(getActivePresentation(false).label).toBe('Inactivo');
  });

  it('E2: solo permite editar programas activos', () => {
    expect(canEditProgram(program)).toBe(true);
    expect(canEditProgram(inactiveProgram)).toBe(false);
  });

  it('E1: valida el formulario vacío y uno completo', () => {
    expect(Object.keys(validateProgramForm(EMPTY_PROGRAM_FORM)).sort()).toEqual([
      'knowledge_network_id',
      'name',
      'program_code',
      'total_hours',
      'training_level',
    ]);
    expect(validateProgramForm(programToFormValues(program))).toEqual({});
  });

  it('E1: rechaza horas que no son enteros positivos', () => {
    const base = programToFormValues(program);
    expect(validateProgramForm({ ...base, total_hours: '0' }).total_hours).toBeDefined();
    expect(validateProgramForm({ ...base, total_hours: '12.5' }).total_hours).toBeDefined();
    expect(validateProgramForm({ ...base, total_hours: 'abc' }).total_hours).toBeDefined();
  });

  it('E1: arma el cuerpo de creación activo', () => {
    const body = toProgramCreate({ ...programToFormValues(program), name: '  Nuevo  ' });
    expect(body).toMatchObject({ name: 'Nuevo', total_hours: 2640, is_active: true });
  });

  it('E2: editar sube la versión en 1', () => {
    expect(toProgramUpdate(program, programToFormValues(program)).version).toBe(program.version + 1);
  });

  it('E3: valida y arma la competencia', () => {
    expect(Object.keys(validateCompetencyForm(EMPTY_COMPETENCY_FORM))).toHaveLength(3);
    expect(toCompetencyCreate({ sena_code: ' 1 ', name: 'X', hours: '40' })).toEqual({
      sena_code: '1',
      name: 'X',
      hours: 40,
      is_active: true,
    });
  });
});