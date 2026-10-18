import { type CurriculumLevel, LEVEL_LABELS } from '../../../domain/curriculum.js';
import ui from './components.module.css';

interface Props {
  level: CurriculumLevel;
  name: string;
  isSaving: boolean;
  error: Error | null;
  onConfirm(): void;
  onCancel(): void;
}

// E5: si el nivel está en uso, el backend responde con conflicto y su mensaje se muestra tal cual.
export function ConfirmDeactivateNodeDialog({ level, name, isSaving, error, onConfirm, onCancel }: Props) {
  return (
    <div className={ui.backdrop} role="presentation" onMouseDown={onCancel}>
      <div
        className={ui.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="deactivate-node-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="deactivate-node-title">Dar de baja la {LEVEL_LABELS[level]}</h2>
        <p>
          «{name}» quedará inactiva. El registro se conserva. Si todavía está en uso por un programa de
          formación activo, el servidor bloqueará la baja y verás el motivo aquí.
        </p>

        {error && <div className={ui.errorBox} role="alert">{error.message}</div>}

        <div className={ui.actions}>
          <button className={ui.secondaryButton} type="button" onClick={onCancel}>Cancelar</button>
          <button className={ui.dangerButton} type="button" disabled={isSaving} onClick={onConfirm}>
            {isSaving ? 'Procesando…' : 'Confirmar baja'}
          </button>
        </div>
      </div>
    </div>
  );
}
