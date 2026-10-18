import { getFichaStatusPresentation } from '../../../domain/ficha.js';
import styles from '../../../App.module.css';

interface Props {
  status: string;
}

export function FichaStatusBadge({ status }: Props) {
  const presentation = getFichaStatusPresentation(status);

  return (
    <span
      className={`${styles.badge} ${styles[`badge-${presentation.tone}`]}`}
      data-known-status={String(presentation.known)}
      title={presentation.known ? undefined : `Valor recibido: ${status}`}
    >
      <span aria-hidden="true">{presentation.symbol}</span>
      {presentation.label}
    </span>
  );
}
