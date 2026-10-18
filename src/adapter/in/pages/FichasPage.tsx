import { type FormEvent, useState } from 'react';

import type { FichasApi } from '../../../application/ports/FichasApi.js';
import { type FichasFilters, useFichas } from '../../../application/useFichas.js';
import {
  FICHA_STATUSES,
  type FichaStatus,
} from '../../../domain/ficha.js';
import styles from '../../../App.module.css';
import { FichaDetailPanel } from '../components/FichaDetailPanel.js';
import { FichaStatusBadge } from '../components/FichaStatusBadge.js';

interface Props {
  api: FichasApi;
}

const STATUS_FILTER_LABELS: Record<FichaStatus, string> = {
  INDUCTION: 'Inducción',
  EXECUTION: 'Ejecución',
  PRODUCTIVE_STAGE: 'Etapa productiva',
  COMPLETED: 'Finalizada',
  CANCELLED: 'Cancelada',
};

export function FichasPage({ api }: Props) {
  const [draftFilters, setDraftFilters] = useState<FichasFilters>({});
  const [filters, setFilters] = useState<FichasFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedFichaId, setSelectedFichaId] = useState<string>();
  const fichas = useFichas(api, { ...filters, page, pageSize });

  const applyFilters = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setFilters(draftFilters);
  };

  const clearFilters = () => {
    setDraftFilters({});
    setFilters({});
    setPage(1);
  };

  const pagination = fichas.pagination;
  const firstItem = pagination && pagination.total_items > 0
    ? (pagination.page - 1) * pagination.page_size + 1
    : 0;
  const lastItem = pagination
    ? Math.min(pagination.page * pagination.page_size, pagination.total_items)
    : 0;

  return (
    <main className={styles.root} data-mfe="academic-management">
      <header className={styles.pageHeader}>
        <div>
          <h1>Fichas</h1>
          <p>Consulta y ubica las fichas del centro de formación.</p>
        </div>
      </header>

      <form className={styles.filters} onSubmit={applyFilters} aria-label="Filtros de fichas">
        <label>
          <span>Programa</span>
          <input
            value={draftFilters.programId ?? ''}
            onChange={(event) => setDraftFilters((current) => ({ ...current, programId: event.target.value }))}
            placeholder="ID del programa"
          />
        </label>
        <label>
          <span>Estado</span>
          <select
            value={draftFilters.status ?? ''}
            disabled={draftFilters.activeOnly}
            onChange={(event) => setDraftFilters((current) => ({
              ...current,
              status: (event.target.value || undefined) as FichaStatus | undefined,
            }))}
          >
            <option value="">Todos</option>
            {FICHA_STATUSES.map((status) => (
              <option key={status} value={status}>{STATUS_FILTER_LABELS[status]}</option>
            ))}
          </select>
        </label>
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            checked={draftFilters.activeOnly ?? false}
            onChange={(event) => setDraftFilters((current) => ({ ...current, activeOnly: event.target.checked }))}
          />
          <span>Solo fichas activas</span>
        </label>
        <div className={styles.filterActions}>
          <button className={styles.secondaryButton} type="button" onClick={clearFilters}>Limpiar</button>
          <button className={styles.primaryButton} type="submit">Aplicar filtros</button>
        </div>
      </form>

      <section className={styles.panel} aria-labelledby="fichas-title">
        <div className={styles.panelHeader}>
          <div>
            <h2 id="fichas-title">Fichas del centro</h2>
            <p>{pagination ? `${pagination.total_items} registros encontrados` : 'Consultando registros'}</p>
          </div>
          {fichas.isLoading && <span className={styles.loadingLabel}>Actualizando…</span>}
        </div>

        {fichas.error && (
          <div className={styles.errorState} role="alert">
            <strong>No pudimos cargar las fichas</strong>
            <p>{fichas.error.message}</p>
            <button type="button" onClick={fichas.retry}>Reintentar</button>
          </div>
        )}

        {!fichas.error && fichas.isLoading && fichas.data.length === 0 && (
          <div className={styles.loadingState} aria-label="Cargando fichas">
            <span /><span /><span />
          </div>
        )}

        {!fichas.error && !fichas.isLoading && fichas.data.length === 0 && (
          <div className={styles.emptyState}>
            <span aria-hidden="true" className={styles.emptyIcon}>⌕</span>
            <h3>No hay fichas que coincidan con los filtros</h3>
            <p>Prueba cambiando o limpiando los criterios de búsqueda.</p>
            <button className={styles.secondaryButton} type="button" onClick={clearFilters}>Limpiar filtros</button>
          </div>
        )}

        {fichas.data.length > 0 && (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr><th>Ficha</th><th>Programa</th><th>Estado</th><th>Capacidad</th></tr>
              </thead>
              <tbody>
                {fichas.data.map((ficha) => (
                  <tr key={ficha.id}>
                    <td data-label="Ficha">
                      <button className={styles.rowLink} type="button" onClick={() => setSelectedFichaId(ficha.id)}>{ficha.ficha_number}</button>
                    </td>
                    <td data-label="Programa"><span className={styles.programId} title={ficha.program_id}>{ficha.program_id}</span></td>
                    <td data-label="Estado"><FichaStatusBadge status={ficha.status} /></td>
                    <td data-label="Capacidad">{ficha.max_capacity} aprendices</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.total_items > 0 && (
          <footer className={styles.pagination}>
            <span>Mostrando {firstItem}–{lastItem} de {pagination.total_items}</span>
            <label>Por página
              <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
                <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
              </select>
            </label>
            <div>
              <button type="button" disabled={page <= 1 || fichas.isLoading} onClick={() => setPage((current) => current - 1)}>‹ Anterior</button>
              <span>Página {pagination.page} de {pagination.total_pages}</span>
              <button type="button" disabled={page >= pagination.total_pages || fichas.isLoading} onClick={() => setPage((current) => current + 1)}>Siguiente ›</button>
            </div>
          </footer>
        )}
      </section>

      <FichaDetailPanel
        api={api}
        fichaId={selectedFichaId}
        onClose={() => setSelectedFichaId(undefined)}
      />
    </main>
  );
}

export default FichasPage;
