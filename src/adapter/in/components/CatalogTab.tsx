import { useState } from 'react';

import type { CatalogState } from '../../../application/useCatalog.js';
import {
  type CatalogFormValues,
  type CurriculumLevel,
  EMPTY_CATALOG_FORM,
  LEVEL_LABELS,
  LEVEL_PLURALS,
  catalogToFormValues,
} from '../../../domain/curriculum.js';
import { BranchStatus } from './BranchStatus.js';
import { CatalogFormModal, type ParentOption } from './CatalogFormModal.js';
import ui from './components.module.css';
import { ConfirmDeactivateNodeDialog } from './ConfirmDeactivateNodeDialog.js';
import styles from './curriculum.module.css';
import { ProgramActiveBadge } from './ProgramActiveBadge.js';

export interface CatalogItem {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface ParentConfig<T> {
  label: string;
  requiredMessage: string;
  options: ParentOption[];
  loadError: Error | null;
  idOf(item: T): string;
}

interface Props<T extends CatalogItem, C, U> {
  level: CurriculumLevel;
  state: CatalogState<T, C, U>;
  subtitle: string;
  parent?: ParentConfig<T>;
  toCreate(values: CatalogFormValues): C;
  toUpdate(values: CatalogFormValues): U;
  page: number;
  pageSize: number;
  onPageChange(page: number): void;
  onPageSizeChange(pageSize: number): void;
  canManage: boolean;
}

type FormState<T> = { kind: 'create' } | { kind: 'edit'; item: T } | null;

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(value));

// Pestaña de un nivel: tabla paginada + crear/editar (modal) + baja con confirmación.
export function CatalogTab<T extends CatalogItem, C, U>({
  level,
  state,
  subtitle,
  parent,
  toCreate,
  toUpdate,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  canManage,
}: Props<T, C, U>) {
  const label = LEVEL_LABELS[level];
  const plural = LEVEL_PLURALS[level];
  const [form, setForm] = useState<FormState<T>>(null);
  const [toDeactivate, setToDeactivate] = useState<T | null>(null);
  const editing = form?.kind === 'edit' ? form.item : undefined;

  const parentText = (item: T) =>
    parent?.options.find((option) => option.id === parent.idOf(item))?.name ?? '—';

  const openCreate = () => {
    state.clearActionError();
    setForm({ kind: 'create' });
  };
  const openEdit = (item: T) => {
    state.clearActionError();
    setForm({ kind: 'edit', item });
  };
  const openDeactivate = (item: T) => {
    state.clearActionError();
    setToDeactivate(item);
  };

  const submit = async (values: CatalogFormValues) => {
    const ok = editing
      ? await state.update(editing.id, toUpdate(values))
      : await state.create(toCreate(values));
    if (ok) setForm(null);
  };

  const confirmDeactivate = async () => {
    if (!toDeactivate) return;
    if (await state.deactivate(toDeactivate.id)) setToDeactivate(null);
  };

  const pagination = state.pagination;
  const firstItem = pagination && pagination.total_items > 0
    ? (pagination.page - 1) * pagination.page_size + 1
    : 0;
  const lastItem = pagination ? Math.min(pagination.page * pagination.page_size, pagination.total_items) : 0;

  return (
    <div className={styles.tabPanel}>
      <div className={styles.tabHeader}>
        <div>
          <h2>{capitalize(plural)}</h2>
          <p className={ui.muted}>{subtitle}</p>
        </div>
        {canManage && (
          <button className={ui.primaryButton} type="button" onClick={openCreate}>
            Nueva {label}
          </button>
        )}
      </div>

      <BranchStatus
        isLoading={state.isLoading}
        error={state.error}
        isEmpty={state.data.length === 0}
        loadingText={`Cargando ${plural}…`}
        emptyText={`Aún no hay ${plural}.`}
        onRetry={state.retry}
      />

      {state.data.length > 0 && (
        <div className={ui.tableWrapper}>
          <table className={ui.table} aria-label={capitalize(plural)}>
            <thead>
              <tr>
                <th>Código</th>
                <th>{capitalize(label)}</th>
                {parent && <th>{parent.label}</th>}
                <th>Estado</th>
                <th>Creado</th>
                {canManage && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {state.data.map((item) => (
                <tr key={item.id}>
                  <td data-label="Código"><strong>{item.code}</strong></td>
                  <td data-label={capitalize(label)}>{item.name}</td>
                  {parent && <td data-label={parent.label}>{parentText(item)}</td>}
                  <td data-label="Estado"><ProgramActiveBadge isActive={item.is_active} /></td>
                  <td data-label="Creado">{formatDate(item.created_at)}</td>
                  {canManage && (
                    <td data-label="Acciones">
                      <div className={ui.rowActions}>
                        <button
                          className={ui.secondaryButton}
                          type="button"
                          aria-label={`Editar ${item.code}`}
                          onClick={() => openEdit(item)}
                        >
                          Editar
                        </button>
                        <button
                          className={ui.dangerButton}
                          type="button"
                          aria-label={`Dar de baja ${item.code}`}
                          disabled={!item.is_active}
                          onClick={() => openDeactivate(item)}
                        >
                          Dar de baja
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.total_items > 0 && (
        <footer className={styles.footer}>
          <span>Mostrando {firstItem}–{lastItem} de {pagination.total_items}</span>
          <label>
            Por página
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
          <div>
            <button
              className={ui.secondaryButton}
              type="button"
              disabled={page <= 1 || state.isLoading}
              onClick={() => onPageChange(page - 1)}
            >
              ‹ Anterior
            </button>
            <span>Página {pagination.page} de {pagination.total_pages}</span>
            <button
              className={ui.secondaryButton}
              type="button"
              disabled={page >= pagination.total_pages || state.isLoading}
              onClick={() => onPageChange(page + 1)}
            >
              Siguiente ›
            </button>
          </div>
        </footer>
      )}

      {form && (
        <CatalogFormModal
          title={editing ? `Editar ${label}` : `Nueva ${label}`}
          submitLabel={editing ? 'Guardar cambios' : `Guardar ${label}`}
          initial={editing ? catalogToFormValues(editing, parent ? parent.idOf(editing) : '') : EMPTY_CATALOG_FORM}
          parent={
            parent
              ? {
                  label: parent.label,
                  requiredMessage: parent.requiredMessage,
                  options: parent.options,
                  loadError: parent.loadError,
                }
              : undefined
          }
          isSaving={state.isSaving}
          error={state.actionError}
          onClose={() => setForm(null)}
          onSubmit={(values) => void submit(values)}
        />
      )}

      {toDeactivate && (
        <ConfirmDeactivateNodeDialog
          level={level}
          name={toDeactivate.name}
          isSaving={state.isSaving}
          error={state.actionError}
          onCancel={() => setToDeactivate(null)}
          onConfirm={() => void confirmDeactivate()}
        />
      )}
    </div>
  );
}
