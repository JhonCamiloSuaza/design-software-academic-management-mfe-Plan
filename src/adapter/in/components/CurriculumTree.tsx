import { useState } from 'react';

import type { TrainingProgramsApi } from '../../../application/ports/TrainingProgramsApi.js';
import { useLearningOutcomes } from '../../../application/useLearningOutcomes.js';
import { useProgramCompetencies } from '../../../application/useProgramCompetencies.js';
import { toCompetencyCreate, type TrainingProgram } from '../../../domain/trainingProgram.js';
import { CompetencyFormModal } from './CompetencyFormModal.js';
import styles from './components.module.css';
import { ProgramActiveBadge } from './ProgramActiveBadge.js';

interface OutcomesProps {
  api: TrainingProgramsApi;
  competencyId: string;
}

// E4: se monta solo al expandir la competencia, así los RAP se piden bajo demanda.
function LearningOutcomesList({ api, competencyId }: OutcomesProps) {
  const outcomes = useLearningOutcomes(api, competencyId);

  if (outcomes.isLoading) return <p className={styles.muted}>Cargando resultados de aprendizaje…</p>;

  if (outcomes.error) {
    return (
      <div className={styles.errorBox} role="alert">
        <p>{outcomes.error.message}</p>
        <button className={styles.secondaryButton} type="button" onClick={outcomes.retry}>Reintentar</button>
      </div>
    );
  }

  if (outcomes.data.length === 0) {
    return <p className={styles.muted}>Esta competencia no tiene resultados de aprendizaje.</p>;
  }

  return (
    <ul className={styles.outcomes} aria-label="Resultados de aprendizaje">
      {outcomes.data.map((outcome) => (
        <li key={outcome.id} className={styles.outcomeItem}>
          <strong>{outcome.code}</strong>
          <span>{outcome.description}</span>
          {!outcome.is_active && <ProgramActiveBadge isActive={false} />}
        </li>
      ))}
    </ul>
  );
}

interface Props {
  api: TrainingProgramsApi;
  program: TrainingProgram;
  canManage: boolean;
}

// E3 + E4: programa > competencias > RAP.
export function CurriculumTree({ api, program, canManage }: Props) {
  const competencies = useProgramCompetencies(api, program.id);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);

  const toggle = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const openCreate = () => {
    competencies.clearActionError();
    setIsCreating(true);
  };

  const total = competencies.pagination?.total_items ?? competencies.data.length;

  return (
    <section className={styles.tree} aria-label="Currículo del programa">
      <div className={styles.treeHeader}>
        <div>
          <h2>Currículo de {program.name}</h2>
          <p className={styles.muted}>Versión vigente {program.version} · {total} competencias</p>
        </div>
        {canManage && (
          <button className={styles.primaryButton} type="button" disabled={!program.is_active} onClick={openCreate}>
            Nueva competencia
          </button>
        )}
      </div>

      {competencies.isLoading && <p className={styles.muted}>Cargando competencias…</p>}

      {competencies.error && (
        <div className={styles.errorBox} role="alert">
          <p>{competencies.error.message}</p>
          <button className={styles.secondaryButton} type="button" onClick={competencies.retry}>Reintentar</button>
        </div>
      )}

      {!competencies.isLoading && !competencies.error && competencies.data.length === 0 && (
        <p className={styles.muted}>Este programa aún no tiene competencias.</p>
      )}

      {competencies.data.length > 0 && (
        <ul className={styles.competencyList}>
          {competencies.data.map((competency) => {
            const isOpen = expanded.has(competency.id);
            const panelId = `outcomes-${competency.id}`;

            return (
              <li key={competency.id} className={styles.competencyItem}>
                <button
                  className={styles.competencyToggle}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={isOpen ? panelId : undefined}
                  onClick={() => toggle(competency.id)}
                >
                  <span aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
                  <span className={styles.code}>{competency.sena_code}</span>
                  <span className={styles.competencyName}>{competency.name}</span>
                  <span className={styles.muted}>{competency.hours} h</span>
                  {!competency.is_active && <ProgramActiveBadge isActive={false} />}
                </button>
                {isOpen && (
                  <div id={panelId} className={styles.outcomesPanel}>
                    <LearningOutcomesList api={api} competencyId={competency.id} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {competencies.pagination && competencies.pagination.total_pages > 1 && (
        <p className={styles.muted}>Se muestran las primeras {competencies.data.length} competencias.</p>
      )}

      {isCreating && (
        <CompetencyFormModal
          isSaving={competencies.isSaving}
          error={competencies.actionError}
          onClose={() => setIsCreating(false)}
          onSubmit={async (values) => {
            if (await competencies.create(toCompetencyCreate(values))) setIsCreating(false);
          }}
        />
      )}
    </section>
  );
}