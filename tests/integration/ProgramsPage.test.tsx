import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProgramsPage } from '../../src/adapter/in/pages/ProgramsPage.js';
import { createProgramsApi } from '../apiMock.js';
import { competency, inactiveProgram, knowledgeNetwork, program } from '../fixturesPrograms.js';

describe('ProgramsPage', () => {
  it('E1: lista código, nombre, nivel, horas, versión y estado', async () => {
    render(<ProgramsPage api={createProgramsApi()} />);

    expect(await screen.findByText(program.program_code)).toBeTruthy();
    expect(screen.getByText(program.name)).toBeTruthy();
    expect(screen.getAllByText('Tecnólogo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('v3').length).toBeGreaterThan(0);
    expect(screen.getByText('2 programas encontrados')).toBeTruthy();
  });

  it('E1: crea un programa con el cuerpo del contrato', async () => {
    const api = createProgramsApi();
    render(<ProgramsPage api={api} />);
    await screen.findByText(program.program_code);

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo programa' }));
    const dialog = screen.getByRole('dialog', { name: 'Nuevo programa' });
    await within(dialog).findByRole('option', { name: knowledgeNetwork.name });

    fireEvent.change(within(dialog).getByLabelText('Red de conocimiento'), { target: { value: knowledgeNetwork.id } });
    fireEvent.change(within(dialog).getByLabelText('Código del programa'), { target: { value: '900001' } });
    fireEvent.change(within(dialog).getByLabelText('Nombre'), { target: { value: 'Programa nuevo' } });
    fireEvent.change(within(dialog).getByLabelText('Nivel de formación'), { target: { value: 'TECHNICIAN' } });
    fireEvent.change(within(dialog).getByLabelText('Horas totales'), { target: { value: '1200' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar programa' }));

    await waitFor(() => expect(api.create).toHaveBeenCalledWith({
      knowledge_network_id: knowledgeNetwork.id,
      program_code: '900001',
      name: 'Programa nuevo',
      training_level: 'TECHNICIAN',
      total_hours: 1200,
      is_active: true,
    }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('E1: no envía el formulario vacío y muestra los errores', async () => {
    const api = createProgramsApi();
    render(<ProgramsPage api={api} />);
    await screen.findByText(program.program_code);

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo programa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar programa' }));

    expect(await screen.findByText('El nombre es obligatorio.')).toBeTruthy();
    expect(api.create).not.toHaveBeenCalled();
  });

  it('E2: muestra la versión vigente y al editar sube la versión en 1', async () => {
    const api = createProgramsApi();
    render(<ProgramsPage api={api} />);
    await screen.findByText(program.program_code);

    fireEvent.click(screen.getByRole('button', { name: `Editar ${program.program_code}` }));
    const dialog = screen.getByRole('dialog', { name: 'Editar programa' });
    expect(within(dialog).getByText(/Versión vigente: 3/)).toBeTruthy();

    fireEvent.change(within(dialog).getByLabelText('Nombre'), { target: { value: 'Otro nombre' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(api.update).toHaveBeenCalledWith(
      program.id,
      expect.objectContaining({ name: 'Otro nombre', version: 4 }),
    ));
  });

  it('E2: no permite editar un programa inactivo', async () => {
    render(<ProgramsPage api={createProgramsApi()} />);
    await screen.findByText(inactiveProgram.program_code);

    const edit = screen.getByRole('button', { name: `Editar ${inactiveProgram.program_code}` });
    expect(edit).toHaveProperty('disabled', true);
  });

  it('E5: da de baja tras confirmar y marca los inactivos', async () => {
    const api = createProgramsApi();
    render(<ProgramsPage api={api} />);
    await screen.findByText(program.program_code);

    expect(screen.getByText('Inactivo')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: `Dar de baja ${program.program_code}` }));
    expect(api.deactivate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar baja' }));

    await waitFor(() => expect(api.deactivate).toHaveBeenCalledWith(program.id));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('E5: muestra el error del servidor si la baja falla', async () => {
    const api = createProgramsApi({ deactivate: vi.fn().mockRejectedValue(new Error('No se puede dar de baja.')) });
    render(<ProgramsPage api={api} />);
    await screen.findByText(program.program_code);

    fireEvent.click(screen.getByRole('button', { name: `Dar de baja ${program.program_code}` }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar baja' }));

    expect(await screen.findByText('No se puede dar de baja.')).toBeTruthy();
  });

  it('E5: el filtro de estado se envía al servidor', async () => {
    const api = createProgramsApi();
    render(<ProgramsPage api={api} />);
    await screen.findByText(program.program_code);

    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'ACTIVE' } });

    await waitFor(() => expect(api.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ is_active: true, page: 1 }),
      expect.any(AbortSignal),
    ));
  });

  it('abre el currículo del programa al seleccionarlo', async () => {
    const api = createProgramsApi();
    render(<ProgramsPage api={api} />);

    fireEvent.click(await screen.findByRole('button', { name: program.name }));

    expect(await screen.findByText(competency.name)).toBeTruthy();
    expect(api.listCompetencies).toHaveBeenCalledWith(program.id, expect.any(Object), expect.any(AbortSignal));
  });

  it('oculta los botones de escritura sin permiso de gestión', async () => {
    render(<ProgramsPage api={createProgramsApi()} canManage={false} />);
    await screen.findByText(program.program_code);

    expect(screen.queryByRole('button', { name: 'Nuevo programa' })).toBeNull();
    expect(screen.queryByRole('button', { name: `Editar ${program.program_code}` })).toBeNull();
  });

  it('muestra el error de carga con opción de reintentar', async () => {
    const api = createProgramsApi({ list: vi.fn().mockRejectedValue(new Error('Servicio no disponible.')) });
    render(<ProgramsPage api={api} />);

    expect(await screen.findByText('Servicio no disponible.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy();
  });
});