import { useMemo } from 'react';

import type { FichasApi } from '../../../application/ports/FichasApi.js';
import { useFichas } from '../../../application/useFichas.js';
import styles from '../../../App.module.css';
import { HttpFichasApi } from '../../out/http/HttpFichasApi.js';

interface Props {
  api?: FichasApi;
  apiBaseUrl?: string;
  onViewAll?(): void;
}

export function ActiveFichasWidget({ api, apiBaseUrl = '/api/v1', onViewAll }: Props) {
  const resolvedApi = useMemo(() => api ?? new HttpFichasApi(apiBaseUrl), [api, apiBaseUrl]);
  const { pagination, isLoading, error, retry } = useFichas(resolvedApi, {
    activeOnly: true,
    page: 1,
    pageSize: 1,
  });

  return (
    <section className={styles.widget} aria-label="Fichas activas">
      <div className={styles.widgetTitle}>
        <svg aria-hidden="true" viewBox="0 0 16 16">
          <path d="M2 14V9m4 5V5m4 9V7m4 7V2" />
        </svg>
        <span>Fichas activas</span>
      </div>
      {isLoading && <strong aria-label="Cargando fichas activas">—</strong>}
      {error && <button type="button" onClick={retry}>Reintentar</button>}
      {!isLoading && !error && <strong>{pagination?.total_items ?? 0}</strong>}
      {onViewAll && <button type="button" className={styles.linkButton} onClick={onViewAll}>Ver todas</button>}
    </section>
  );
}

export default ActiveFichasWidget;
