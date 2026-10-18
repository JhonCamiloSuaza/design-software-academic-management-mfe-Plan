import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FichaStatusBadge } from '../../src/adapter/in/components/FichaStatusBadge.js';

describe('FichaStatusBadge', () => {
  it('presenta un valor no reconocido como estado desconocido sin romper el render', () => {
    render(<FichaStatusBadge status="PAUSED_BY_EXTERNAL_SYSTEM" />);

    const badge = screen.getByText('Estado desconocido');
    expect(badge.getAttribute('data-known-status')).toBe('false');
    expect(badge.getAttribute('title')).toContain('PAUSED_BY_EXTERNAL_SYSTEM');
  });
});
