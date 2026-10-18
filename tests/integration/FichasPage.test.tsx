import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FichasPage } from '../../src/adapter/in/pages/FichasPage.js';
import type { FichasApi } from '../../src/application/ports/FichasApi.js';
import { ficha, page } from '../fixtures.js';

const createApi = (overrides: Partial<FichasApi> = {}): FichasApi => ({
  list: vi.fn().mockResolvedValue(page),
  getById: vi.fn().mockResolvedValue(ficha),
  ...overrides,
});

describe('FichasPage', () => {
  it('lista programa, estado, capacidad y paginación', async () => {
    render(<FichasPage api={createApi()} />);

    expect(await screen.findByText('2874412')).toBeTruthy();
    expect(screen.getByText(ficha.program_id)).toBeTruthy();
    expect(screen.getByText('Ejecución', { selector: '[data-known-status="true"]' })).toBeTruthy();
    expect(screen.getByText('Mostrando 1–1 de 1')).toBeTruthy();
    expect(screen.getByText('30 aprendices')).toBeTruthy();
  });

  it('consulta el detalle al abrir una ficha', async () => {
    const api = createApi();
    render(<FichasPage api={api} />);

    fireEvent.click(await screen.findByRole('button', { name: '2874412' }));

    await waitFor(() => expect(api.getById).toHaveBeenCalledWith(ficha.id, expect.any(AbortSignal)));
    expect(await screen.findByRole('heading', { name: 'Ficha 2874412' })).toBeTruthy();
    expect(screen.getByText('Versión cursada')).toBeTruthy();
  });

  it('muestra un estado vacío explícito', async () => {
    const api = createApi({
      list: vi.fn().mockResolvedValue({
        data: [],
        pagination: { page: 1, page_size: 10, total_items: 0, total_pages: 0 },
      }),
    });

    render(<FichasPage api={api} />);

    expect(await screen.findByText('No hay fichas que coincidan con los filtros')).toBeTruthy();
  });

  it('envía filtros al servidor sin filtrar la lista en cliente', async () => {
    const api = createApi();
    render(<FichasPage api={api} />);
    await screen.findByText('2874412');

    fireEvent.change(screen.getByLabelText('Programa'), { target: { value: ficha.program_id } });
    fireEvent.click(screen.getByLabelText('Solo fichas activas'));
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }));

    await waitFor(() => expect(api.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ program_id: ficha.program_id, status: 'EXECUTION', page: 1 }),
      expect.any(AbortSignal),
    ));
  });
});
