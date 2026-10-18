import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CurriculumTree } from '../../src/adapter/in/components/CurriculumTree.js';
import { createProgramsApi } from '../apiMock.js';
import { competency, learningOutcome, pageOf, program } from '../fixturesPrograms.js';

describe('CurriculumTree', () => {
  it('E3: lista las competencias del programa sin pedir los RAP todavía', async () => {
    const api = createProgramsApi();
    render(<CurriculumTree api={api} program={program} canManage />);

    expect(await screen.findByText(competency.name)).toBeTruthy();
    expect(screen.getByText(competency.sena_code)).toBeTruthy();
    expect(screen.getByText('480 h')).toBeTruthy();
    expect(api.listCompetencies).toHaveBeenCalledWith(program.id, expect.any(Object), expect.any(AbortSignal));
    expect(api.listLearningOutcomes).not.toHaveBeenCalled();
  });

  it('E3: crea una competencia en el programa', async () => {
    const api = createProgramsApi();
    render(<CurriculumTree api={api} program={program} canManage />);
    await screen.findByText(competency.name);

    fireEvent.click(screen.getByRole('button', { name: 'Nueva competencia' }));
    const dialog = screen.getByRole('dialog', { name: 'Nueva competencia' });
    fireEvent.change(within(dialog).getByLabelText('Código SENA'), { target: { value: '220501097' } });
    fireEvent.change(within(dialog).getByLabelText('Nombre'), { target: { value: 'Otra competencia' } });
    fireEvent.change(within(dialog).getByLabelText('Horas'), { target: { value: '120' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar competencia' }));

    await waitFor(() => expect(api.createCompetency).toHaveBeenCalledWith(program.id, {
      sena_code: '220501097',
      name: 'Otra competencia',
      hours: 120,
      is_active: true,
    }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('E3: no deja crear competencias en un programa inactivo', async () => {
    render(<CurriculumTree api={createProgramsApi()} program={{ ...program, is_active: false }} canManage />);
    await screen.findByText(competency.name);

    expect(screen.getByRole('button', { name: 'Nueva competencia' })).toHaveProperty('disabled', true);
  });

  it('E4: al expandir una competencia lista sus RAP', async () => {
    const api = createProgramsApi();
    render(<CurriculumTree api={api} program={program} canManage />);

    const toggle = await screen.findByRole('button', { name: new RegExp(competency.name) });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(toggle);

    expect(await screen.findByText(learningOutcome.description)).toBeTruthy();
    expect(screen.getByText(learningOutcome.code)).toBeTruthy();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(api.listLearningOutcomes).toHaveBeenCalledWith(
      competency.id,
      expect.objectContaining({ page: 1 }),
      expect.any(AbortSignal),
    );
  });

  it('E4: indica cuando la competencia no tiene RAP', async () => {
    const api = createProgramsApi({ listLearningOutcomes: vi.fn().mockResolvedValue(pageOf([])) });
    render(<CurriculumTree api={api} program={program} canManage />);

    fireEvent.click(await screen.findByRole('button', { name: new RegExp(competency.name) }));

    expect(await screen.findByText('Esta competencia no tiene resultados de aprendizaje.')).toBeTruthy();
  });

  it('oculta el botón de crear sin permiso de gestión', async () => {
    render(<CurriculumTree api={createProgramsApi()} program={program} canManage={false} />);
    await screen.findByText(competency.name);

    expect(screen.queryByRole('button', { name: 'Nueva competencia' })).toBeNull();
  });
});