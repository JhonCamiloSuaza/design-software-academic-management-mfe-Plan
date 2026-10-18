import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CurriculumSetupPage } from '../../src/adapter/in/pages/CurriculumSetupPage.js';
import { createCurriculumApi } from '../apiCurriculumMock.js';
import { inactiveTechLine, knowledgeNetwork, techLine, techNetwork } from '../fixturesCurriculum.js';

const lineText = `${techLine.code} · ${techLine.name}`;
const networkText = `${techNetwork.code} · ${techNetwork.name}`;

const goTo = (name: string) => fireEvent.click(screen.getByRole('tab', { name }));

describe('CurriculumSetupPage', () => {
  it('E1: lista las líneas con estado y paginación', async () => {
    render(<CurriculumSetupPage api={createCurriculumApi()} />);

    expect(await screen.findByText(techLine.name)).toBeTruthy();
    expect(screen.getByText(inactiveTechLine.name)).toBeTruthy();
    expect(screen.getByText('Inactivo')).toBeTruthy();
    expect(screen.getByText('Mostrando 1–2 de 2')).toBeTruthy();
  });

  it('E1: el tamaño de página se envía al servidor', async () => {
    const api = createCurriculumApi();
    render(<CurriculumSetupPage api={api} />);
    await screen.findByText(techLine.name);

    fireEvent.change(screen.getByLabelText('Por página'), { target: { value: '20' } });

    await waitFor(() => expect(api.listTechLines).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, page_size: 20 }),
      expect.any(AbortSignal),
    ));
  });

  it('E1: crea una línea con el cuerpo del contrato', async () => {
    const api = createCurriculumApi();
    render(<CurriculumSetupPage api={api} />);
    await screen.findByText(techLine.name);

    fireEvent.click(screen.getByRole('button', { name: 'Nueva línea tecnológica' }));
    const dialog = screen.getByRole('dialog', { name: 'Nueva línea tecnológica' });
    fireEvent.change(within(dialog).getByLabelText('Código'), { target: { value: 'LT-NEW' } });
    fireEvent.change(within(dialog).getByLabelText('Nombre'), { target: { value: 'Línea nueva' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar línea tecnológica' }));

    await waitFor(() => expect(api.createTechLine).toHaveBeenCalledWith({
      name: 'Línea nueva',
      code: 'LT-NEW',
      is_active: true,
    }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('E1: no envía el formulario vacío y muestra los errores', async () => {
    const api = createCurriculumApi();
    render(<CurriculumSetupPage api={api} />);
    await screen.findByText(techLine.name);

    fireEvent.click(screen.getByRole('button', { name: 'Nueva línea tecnológica' }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar línea tecnológica' }));

    expect(await screen.findByText('El nombre es obligatorio.')).toBeTruthy();
    expect(api.createTechLine).not.toHaveBeenCalled();
  });

  it('E1: edita una línea con PUT', async () => {
    const api = createCurriculumApi();
    render(<CurriculumSetupPage api={api} />);
    await screen.findByText(techLine.name);

    fireEvent.click(screen.getByRole('button', { name: `Editar ${techLine.code}` }));
    const dialog = screen.getByRole('dialog', { name: 'Editar línea tecnológica' });
    fireEvent.change(within(dialog).getByLabelText('Nombre'), { target: { value: 'Otro nombre' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(api.updateTechLine).toHaveBeenCalledWith(techLine.id, {
      name: 'Otro nombre',
      code: techLine.code,
      is_active: true,
    }));
  });

  it('E1: una línea inactiva se puede reactivar desde el selector de estado', async () => {
    const api = createCurriculumApi();
    render(<CurriculumSetupPage api={api} />);
    await screen.findByText(inactiveTechLine.name);

    fireEvent.click(screen.getByRole('button', { name: `Editar ${inactiveTechLine.code}` }));
    const dialog = screen.getByRole('dialog', { name: 'Editar línea tecnológica' });
    fireEvent.change(within(dialog).getByLabelText('Estado'), { target: { value: 'ACTIVE' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(api.updateTechLine).toHaveBeenCalledWith(
      inactiveTechLine.id,
      expect.objectContaining({ is_active: true }),
    ));
  });

  it('E2 + E4: la pestaña de redes tecnológicas muestra la línea de la que depende cada red', async () => {
    const api = createCurriculumApi();
    render(<CurriculumSetupPage api={api} />);
    await screen.findByText(techLine.name);

    goTo('Redes tecnológicas');

    expect(await screen.findByText(techNetwork.name)).toBeTruthy();
    expect(await screen.findByText(lineText)).toBeTruthy();
    expect(api.listTechLines).toHaveBeenCalled();
    expect(api.listTechNetworks).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 10 }),
      expect.any(AbortSignal),
    );
  });

  it('E2: el selector de línea usa el listado de líneas y crea la red', async () => {
    const api = createCurriculumApi();
    render(<CurriculumSetupPage api={api} />);
    await screen.findByText(techLine.name);
    goTo('Redes tecnológicas');
    await screen.findByText(techNetwork.name);

    fireEvent.click(screen.getByRole('button', { name: 'Nueva red tecnológica' }));
    const dialog = screen.getByRole('dialog', { name: 'Nueva red tecnológica' });
    await within(dialog).findByRole('option', { name: lineText });

    fireEvent.change(within(dialog).getByLabelText('Línea tecnológica'), { target: { value: techLine.id } });
    fireEvent.change(within(dialog).getByLabelText('Código'), { target: { value: 'RT-NEW' } });
    fireEvent.change(within(dialog).getByLabelText('Nombre'), { target: { value: 'Red nueva' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar red tecnológica' }));

    await waitFor(() => expect(api.createTechNetwork).toHaveBeenCalledWith({
      tech_line_id: techLine.id,
      name: 'Red nueva',
      code: 'RT-NEW',
      is_active: true,
    }));
  });

  it('E2: exige elegir la línea antes de crear la red', async () => {
    const api = createCurriculumApi();
    render(<CurriculumSetupPage api={api} />);
    await screen.findByText(techLine.name);
    goTo('Redes tecnológicas');
    await screen.findByText(techNetwork.name);

    fireEvent.click(screen.getByRole('button', { name: 'Nueva red tecnológica' }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar red tecnológica' }));

    expect(await screen.findByText('Selecciona una línea tecnológica.')).toBeTruthy();
    expect(api.createTechNetwork).not.toHaveBeenCalled();
  });

  it('E3 + E4: la pestaña de redes de conocimiento muestra la red tecnológica y crea una red', async () => {
    const api = createCurriculumApi();
    render(<CurriculumSetupPage api={api} />);
    await screen.findByText(techLine.name);
    goTo('Redes de conocimiento');

    expect(await screen.findByText(knowledgeNetwork.name)).toBeTruthy();
    expect(await screen.findByText(networkText)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Nueva red de conocimiento' }));
    const dialog = screen.getByRole('dialog', { name: 'Nueva red de conocimiento' });
    await within(dialog).findByRole('option', { name: networkText });

    fireEvent.change(within(dialog).getByLabelText('Red tecnológica'), { target: { value: techNetwork.id } });
    fireEvent.change(within(dialog).getByLabelText('Código'), { target: { value: 'RC-NEW' } });
    fireEvent.change(within(dialog).getByLabelText('Nombre'), { target: { value: 'Conocimiento nuevo' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar red de conocimiento' }));

    await waitFor(() => expect(api.createKnowledgeNetwork).toHaveBeenCalledWith({
      tech_network_id: techNetwork.id,
      name: 'Conocimiento nuevo',
      code: 'RC-NEW',
      is_active: true,
    }));
  });

  it('E5: da de baja tras confirmar', async () => {
    const api = createCurriculumApi();
    render(<CurriculumSetupPage api={api} />);
    await screen.findByText(techLine.name);

    fireEvent.click(screen.getByRole('button', { name: `Dar de baja ${techLine.code}` }));
    expect(api.deactivateTechLine).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar baja' }));

    await waitFor(() => expect(api.deactivateTechLine).toHaveBeenCalledWith(techLine.id));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });

  it('E5: un nivel en uso se bloquea con el mensaje del backend y el diálogo sigue abierto', async () => {
    const message = 'No se puede desactivar: hay programas de formación activos que la usan.';
    const api = createCurriculumApi({ deactivateTechNetwork: vi.fn().mockRejectedValue(new Error(message)) });
    render(<CurriculumSetupPage api={api} />);
    await screen.findByText(techLine.name);
    goTo('Redes tecnológicas');
    await screen.findByText(techNetwork.name);

    fireEvent.click(screen.getByRole('button', { name: `Dar de baja ${techNetwork.code}` }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar baja' }));

    expect(await screen.findByText(message)).toBeTruthy();
    expect(screen.getByRole('alertdialog')).toBeTruthy();
  });

  it('no permite dar de baja un registro inactivo', async () => {
    render(<CurriculumSetupPage api={createCurriculumApi()} />);
    await screen.findByText(inactiveTechLine.name);

    expect(screen.getByRole('button', { name: `Dar de baja ${inactiveTechLine.code}` })).toHaveProperty('disabled', true);
  });

  it('oculta los botones de escritura sin permiso de gestión', async () => {
    render(<CurriculumSetupPage api={createCurriculumApi()} canManage={false} />);
    await screen.findByText(techLine.name);

    expect(screen.queryByRole('button', { name: 'Nueva línea tecnológica' })).toBeNull();
    expect(screen.queryByRole('button', { name: `Editar ${techLine.code}` })).toBeNull();
  });

  it('muestra el error de carga con opción de reintentar', async () => {
    const api = createCurriculumApi({ listTechLines: vi.fn().mockRejectedValue(new Error('Servicio no disponible.')) });
    render(<CurriculumSetupPage api={api} />);

    expect(await screen.findByText('Servicio no disponible.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy();
  });
});
