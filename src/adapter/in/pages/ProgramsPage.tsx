import { useMemo, useState } from 'react';

import type { TrainingProgramsApi } from '../../../application/ports/TrainingProgramsApi.js';
import { useKnowledgeNetworks } from '../../../application/useKnowledgeNetworks.js';
import { useTrainingPrograms } from '../../../application/useTrainingPrograms.js';
import {
  toProgramCreate,
  toProgramUpdate,
  type ProgramFormValues,
  type TrainingProgram,
} from '../../../domain/trainingProgram.js';
import { ConfirmDeactivateDialog } from '../components/ConfirmDeactivateDialog.js';
import { CurriculumTree } from '../components/CurriculumTree.js';
import { ProgramFormModal } from '../components/ProgramFormModal.js';
import { ProgramsTable } from '../components/ProgramsTable.js';
import ui from '../components/components.module.css';
import styles from './ProgramsPage.module.css';

interface Props {
  api: TrainingProgramsApi;
  // ACADEMIC_PROGRAM_MANAGE: si el usuario no lo tiene, se ocultan los botones de escritura.
  canManage?: boolean;
}

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
type FormState = { kind: 'create' } | { kind: 'edit'; program: TrainingProgram } | null;

export function ProgramsPage({ api, canManage = true }: Props) {
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string>();
  const [form, setForm] = useState<FormState>(null);
  const [toDeactivate, setToDeactivate] = useState<TrainingProgram | null>(null);

  const programs = useTrainingPrograms(api, {
    page,
    isActive: status === 'ALL' ? undefined : status === 'ACTIVE',
  });
  const networks = useKnowledgeNetworks(api);
  const networkNames = useMemo(
    () => new Map(networks.data.map((network) => [network.id, network.name] as const)),
    [networks.data],
  );
  const selected = programs.data.find((program) => program.id === selectedId);
  const pagination = programs.pagination;

  const openCreate = () => {
    programs.clearActionError();
    setForm({ kind: 'create' });
  };

  const openEdit = (program: TrainingProgram) => {
    programs.clearActionError();
    setForm({ kind: 'edit', program });
  };

  const openDeactivate = (program: TrainingProgram) => {
    programs.clearActionError();
    setToDeactivate(program);
  };

  const submitProgram = async (values: ProgramFormValues) => {
    const ok = form?.kind === 'edit'
      ? await programs.update(form.program.id, toProgramUpdate(form.program, values))
      : await programs.create(toProgramCreate(values));
    if (ok) setForm(null);
  };

  const confirmDeactivate = async () => {
    if (!toDeactivate) return;
    if (await programs.deactivate(toDeactivate.id)) setToDeactivate(null);
  };

  return (
    <main className={styles.root} data-mfe="academic-management">
      <header className={styles.pageHeader}>
        <div>
          <h1>Currículo académico</h1>
          <p>Administra los programas de formación, sus competencias y resultados de aprendizaje.</p>
        </div>
        {canManage && (
          <button className={ui.primaryButton} type="button" onClick={openCreate}>Nuevo programa</button>
        )}
      </header>

      <section className={styles.panel} aria-labelledby="programs-title">
        <div className={styles.panelHeader}>
          <div>
            <h2 id="programs-title">Programas de formación</h2>
            <p>{pagination ? `${pagination.total_items} programas encontrados` : 'Consultando programas'}</p>
          </div>
          <label className={styles.filter}>
            <span>Estado</span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as StatusFilter);
                setPage(1);
              }}
            >
              <option value="ALL">Todos</option>
              <option value="ACTIVE">Activos</option>
              <option value="INACTIVE">Inactivos</option>
            </select>
          </label>
        </div>

        {programs.error && (
          <div className={ui.errorBox} role="alert">
            <strong>No pudimos cargar los programas</strong>
            <p>{programs.error.message}</p>
            <button className={ui.secondaryButton} type="button" onClick={programs.retry}>Reintentar</button>
          </div>
        )}

        {!programs.error && programs.isLoading && programs.data.length === 0 && (
          <p className={ui.muted} role="status" aria-label="Cargando programas">Cargando programas…</p>
        )}

        {!programs.error && !programs.isLoading && programs.data.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No hay programas que coincidan con el filtro</h3>
            <p>Prueba con otro estado{canManage ? ' o crea un programa nuevo.' : '.'}</p>
          </div>
        )}

        {programs.data.length > 0 && (
          <ProgramsTable
            programs={programs.data}
            networkNames={networkNames}
            selectedId={selectedId}
            canManage={canManage}
            onSelect={(program) => setSelectedId(program.id)}
            onEdit={openEdit}
            onDeactivate={openDeactivate}
          />
        )}

        {pagination && pagination.total_items > 0 && (
          <footer className={styles.pagination}>
            <span>Página {pagination.page} de {pagination.total_pages}</span>
            <div>
              <button
                className={ui.secondaryButton}
                type="button"
                disabled={page <= 1 || programs.isLoading}
                onClick={() => setPage((current) => current - 1)}
              >
                ‹ Anterior
              </button>
              <button
                className={ui.secondaryButton}
                type="button"
                disabled={page >= pagination.total_pages || programs.isLoading}
                onClick={() => setPage((current) => current + 1)}
              >
                Siguiente ›
              </button>
            </div>
          </footer>
        )}
      </section>

      {selected && <CurriculumTree key={selected.id} api={api} program={selected} canManage={canManage} />}

      {form && (
        <ProgramFormModal
          program={form.kind === 'edit' ? form.program : undefined}
          networks={networks.data}
          networksError={networks.error}
          isSaving={programs.isSaving}
          error={programs.actionError}
          onClose={() => setForm(null)}
          onSubmit={(values) => void submitProgram(values)}
        />
      )}

      {toDeactivate && (
        <ConfirmDeactivateDialog
          program={toDeactivate}
          isSaving={programs.isSaving}
          error={programs.actionError}
          onCancel={() => setToDeactivate(null)}
          onConfirm={() => void confirmDeactivate()}
        />
      )}
    </main>
  );
}

export default ProgramsPage;