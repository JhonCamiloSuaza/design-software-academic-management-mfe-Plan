import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ActiveFichasWidget } from '../../src/adapter/in/components/ActiveFichasWidget.js';
import type { FichasApi } from '../../src/application/ports/FichasApi.js';
import { ficha } from '../fixtures.js';

describe('ActiveFichasWidget', () => {
  it('reutiliza el listado con el filtro operativo de fichas activas', async () => {
    const api: FichasApi = {
      list: vi.fn().mockResolvedValue({
        data: [ficha],
        pagination: { page: 1, page_size: 1, total_items: 12, total_pages: 12 },
      }),
      getById: vi.fn(),
    };

    render(<ActiveFichasWidget api={api} />);

    expect(await screen.findByText('12')).toBeTruthy();
    await waitFor(() => expect(api.list).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 1, status: 'EXECUTION' }),
      expect.any(AbortSignal),
    ));
  });
});
