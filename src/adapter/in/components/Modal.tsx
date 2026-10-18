import { type KeyboardEvent, type ReactNode, useEffect, useRef } from 'react';

import styles from './components.module.css';

interface Props {
  role?: 'dialog' | 'alertdialog';
  labelledBy: string;
  describedBy?: string;
  /** Selector CSS del elemento que recibe el foco al abrir (por defecto, el primero enfocable). */
  initialFocus?: string;
  onClose(): void;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Contenedor accesible para modales: foco inicial dentro, Tab atrapado,
 * Esc cierra y el foco vuelve al elemento que lo abrio.
 */
export function Modal({ role = 'dialog', labelledBy, describedBy, initialFocus, onClose, children }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const target =
      (initialFocus ? dialog?.querySelector<HTMLElement>(initialFocus) : null) ??
      dialog?.querySelector<HTMLElement>(FOCUSABLE) ??
      dialog;
    target?.focus();

    return () => {
      previous?.focus();
    };
  }, [initialFocus]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onCloseRef.current();
      return;
    }
    if (event.key !== 'Tab') return;

    const dialog = dialogRef.current;
    const items = Array.from(dialog?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    if (items.length === 0) {
      event.preventDefault();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === dialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </div>
  );
}