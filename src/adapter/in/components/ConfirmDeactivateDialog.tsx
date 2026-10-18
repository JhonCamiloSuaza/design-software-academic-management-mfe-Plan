import type { TrainingProgram } from '../../../domain/trainingProgram.js';
import styles from './components.module.css';
import { Modal } from './Modal.js';

interface Props {
  program: TrainingProgram;
  isSaving: boolean;
  error: Error | null;
  onConfirm(): void;
  onCancel(): void;
}

// E5: confirmación de la baja lógica (is_active = false).
// El foco inicial va en "Cancelar" para que una acción destructiva no se confirme por accidente.
export function ConfirmDeactivateDialog({ program, isSaving, error, onConfirm, onCancel }: Props) {
  return (
    <Modal
      role="alertdialog"
      labelledBy="deactivate-title"
      describedBy="deactivate-description"
      initialFocus="[data-autofocus]"
      onClose={onCancel}
    >
      <h2 id="deactivate-title">Dar de baja el programa</h2>
      <p id="deactivate-description">
        «{program.name}» quedará inactivo y dejará de aparecer en los selectores de otras pantallas.
        El registro y su historial se conservan.
      </p>

      {error && <div className={styles.errorBox} role="alert">{error.message}</div>}

      <div className={styles.actions}>
        <button className={styles.secondaryButton} type="button" data-autofocus onClick={onCancel}>Cancelar</button>
        <button className={styles.dangerButton} type="button" disabled={isSaving} onClick={onConfirm}>
          {isSaving ? 'Procesando…' : 'Confirmar baja'}
        </button>
      </div>
    </Modal>
  );
}