import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Modal } from '../../src/adapter/in/components/Modal.js';

afterEach(cleanup);

function Harness({ onClose = () => {} }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Abrir</button>
      {open && (
        <Modal
          labelledBy="t"
          onClose={() => {
            onClose();
            setOpen(false);
          }}
        >
          <h2 id="t">Titulo</h2>
          <input aria-label="primero" />
          <button type="button">segundo</button>
          <button type="button">ultimo</button>
        </Modal>
      )}
    </>
  );
}

const open = () => fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));

describe('Modal accesible', () => {
  it('mueve el foco al primer control al abrir', () => {
    render(<Harness />);
    open();
    expect(document.activeElement).toBe(screen.getByLabelText('primero'));
  });

  it('Esc cierra y el foco vuelve al boton que lo abrio', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    const opener = screen.getByRole('button', { name: 'Abrir' });
    opener.focus();
    open();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('Tab en el ultimo control vuelve al primero y Shift+Tab en el primero va al ultimo', () => {
    render(<Harness />);
    open();
    const dialog = screen.getByRole('dialog');
    const last = screen.getByRole('button', { name: 'ultimo' });
    last.focus();

    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByLabelText('primero'));

    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('clic en el fondo cierra; clic dentro del dialogo no', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    open();

    fireEvent.mouseDown(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(screen.getByRole('dialog').parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});