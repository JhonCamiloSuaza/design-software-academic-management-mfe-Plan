import { getActivePresentation } from '../../../domain/trainingProgram.js';
import styles from './components.module.css';

interface Props {
  isActive: boolean;
}

// E5: Activo / Inactivo (la baja lógica nunca borra el registro).
export function ProgramActiveBadge({ isActive }: Props) {
  const presentation = getActivePresentation(isActive);

  return (
    <span className={`${styles.badge} ${styles[`badge-${presentation.tone}`]}`} data-active={String(isActive)}>
      <span aria-hidden="true">{presentation.symbol}</span>
      {presentation.label}
    </span>
  );
}