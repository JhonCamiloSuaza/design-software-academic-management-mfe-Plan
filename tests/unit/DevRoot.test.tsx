import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DevRoot } from '../../src/preview/DevRoot.js';

vi.mock('../../src/App.js', () => ({ default: () => <p>pantalla-fichas</p> }));
vi.mock('../../src/preview/ProgramsPreview.js', () => ({ ProgramsPreview: () => <p>pantalla-programas</p> }));

beforeEach(() => {
  window.location.hash = '';
});

afterEach(cleanup);

describe('DevRoot', () => {
  it('en la raiz muestra Fichas y el acceso a la vista previa de programas', () => {
    render(<DevRoot />);

    expect(screen.getByText('pantalla-fichas')).toBeTruthy();
    const link = screen.getByRole('link', { name: /Programas y competencias/ });
    expect(link.getAttribute('href')).toBe('#/preview/programas');
  });

  it('con #/preview/programas muestra la vista previa y marca el enlace activo', () => {
    window.location.hash = '#/preview/programas';
    render(<DevRoot />);

    expect(screen.getByText('pantalla-programas')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Programas y competencias/ }).getAttribute('aria-current')).toBe('page');
  });

  it('cambia de vista cuando cambia el hash', () => {
    render(<DevRoot />);

    act(() => {
      window.location.hash = '#/preview/programas';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(screen.getByText('pantalla-programas')).toBeTruthy();
    expect(screen.queryByText('pantalla-fichas')).toBeNull();
  });
});