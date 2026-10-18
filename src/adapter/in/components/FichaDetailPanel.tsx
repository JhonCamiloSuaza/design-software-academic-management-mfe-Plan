import type { FichasApi } from '../../../application/ports/FichasApi.js';
import { useFichaDetail } from '../../../application/useFichaDetail.js';
import { MODALITY_LABELS, SHIFT_LABELS } from '../../../domain/ficha.js';
import styles from '../../../App.module.css';
import { FichaStatusBadge } from './FichaStatusBadge.js';

interface Props {
  api: FichasApi;
  fichaId?: string;
  onClose(): void;
}

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
    : 'No aplica';

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export function FichaDetailPanel({ api, fichaId, onClose }: Props) {
  const detail = useFichaDetail(api, fichaId);

  if (!fichaId) return null;

  return (
    <div className={styles.drawerBackdrop} role="presentation" onMouseDown={onClose}>
      <aside
        aria-label="Detalle de ficha"
        aria-live="polite"
        aria-modal="true"
        className={styles.drawer}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className={styles.drawerHeader}>
          <div>
            <span className={styles.eyebrow}>Detalle de ficha</span>
            <h2>{detail.data ? `Ficha ${detail.data.ficha_number}` : 'Cargando ficha…'}</h2>
          </div>
          <button className={styles.iconButton} type="button" onClick={onClose} aria-label="Cerrar detalle">×</button>
        </div>

        {detail.isLoading && <div className={styles.detailLoading}>Consultando información completa…</div>}
        {detail.error && (
          <div className={styles.errorState} role="alert">
            <p>{detail.error.message}</p>
            <button type="button" onClick={detail.retry}>Reintentar</button>
          </div>
        )}
        {detail.data && (
          <div className={styles.detailBody}>
            <FichaStatusBadge status={detail.data.status} />
            <section>
              <h3>Programa</h3>
              <dl className={styles.detailGrid}>
                <div><dt>Programa</dt><dd>{detail.data.program_id}</dd></div>
                <div><dt>Versión cursada</dt><dd>{detail.data.program_version}</dd></div>
              </dl>
            </section>
            <section>
              <h3>Datos de la ficha</h3>
              <dl className={styles.detailGrid}>
                <div><dt>Centro de formación</dt><dd>{detail.data.training_center_id}</dd></div>
                <div><dt>Jornada</dt><dd>{SHIFT_LABELS[detail.data.training_shift]}</dd></div>
                <div><dt>Modalidad</dt><dd>{MODALITY_LABELS[detail.data.training_modality]}</dd></div>
                <div><dt>Cupo máximo</dt><dd>{detail.data.max_capacity} aprendices</dd></div>
                <div><dt>Fecha de inicio</dt><dd>{formatDate(detail.data.start_date)}</dd></div>
                <div><dt>Cierre esperado</dt><dd>{formatDate(detail.data.expected_end_date)}</dd></div>
                <div><dt>Cierre real</dt><dd>{formatDate(detail.data.actual_end_date)}</dd></div>
                <div><dt>Creada</dt><dd>{formatDateTime(detail.data.created_at)}</dd></div>
                <div><dt>Última actualización</dt><dd>{formatDateTime(detail.data.updated_at)}</dd></div>
              </dl>
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}
