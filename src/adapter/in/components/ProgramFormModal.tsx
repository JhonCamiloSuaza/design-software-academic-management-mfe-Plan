import { type FormEvent, useState } from 'react';

import {
  EMPTY_PROGRAM_FORM,
  TRAINING_LEVELS,
  TRAINING_LEVEL_LABELS,
  programToFormValues,
  validateProgramForm,
  type KnowledgeNetwork,
  type ProgramFormErrors,
  type ProgramFormValues,
  type TrainingLevel,
  type TrainingProgram,
} from '../../../domain/trainingProgram.js';
import styles from './components.module.css';
import { Modal } from './Modal.js';

interface Props {
  program?: TrainingProgram;
  networks: KnowledgeNetwork[];
  networksError: Error | null;
  isSaving: boolean;
  error: Error | null;
  onSubmit(values: ProgramFormValues): void;
  onClose(): void;
}

// E1: crear. E2: editar (subir la versión en 1 lo resuelve el dominio).
export function ProgramFormModal({ program, networks, networksError, isSaving, error, onSubmit, onClose }: Props) {
  const [values, setValues] = useState<ProgramFormValues>(() =>
    program ? programToFormValues(program) : EMPTY_PROGRAM_FORM,
  );
  const [errors, setErrors] = useState<ProgramFormErrors>({});
  const title = program ? 'Editar programa' : 'Nuevo programa';

  const set = <K extends keyof ProgramFormValues>(key: K, value: ProgramFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateProgramForm(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(values);
  };

  const hasCurrentNetwork = networks.some((network) => network.id === values.knowledge_network_id);

  return (
    <Modal labelledBy="program-form-title" onClose={onClose}>
      <h2 id="program-form-title">{title}</h2>
      {program && (
        <p className={styles.hint}>
          Versión vigente: {program.version}. Al guardar pasará a la versión {program.version + 1}.
        </p>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.field}>
          <span>Red de conocimiento</span>
          <select
            value={values.knowledge_network_id}
            aria-invalid={errors.knowledge_network_id ? true : undefined}
            onChange={(event) => set('knowledge_network_id', event.target.value)}
          >
            <option value="">Selecciona una red</option>
            {values.knowledge_network_id && !hasCurrentNetwork && (
              <option value={values.knowledge_network_id}>Red actual del programa</option>
            )}
            {networks.map((network) => (
              <option key={network.id} value={network.id}>{network.name}</option>
            ))}
          </select>
          {networksError && <span className={styles.fieldError}>No pudimos cargar las redes de conocimiento.</span>}
          {errors.knowledge_network_id && <span className={styles.fieldError}>{errors.knowledge_network_id}</span>}
        </label>

        <label className={styles.field}>
          <span>Código del programa</span>
          <input
            value={values.program_code}
            aria-invalid={errors.program_code ? true : undefined}
            onChange={(event) => set('program_code', event.target.value)}
          />
          {errors.program_code && <span className={styles.fieldError}>{errors.program_code}</span>}
        </label>

        <label className={styles.field}>
          <span>Nombre</span>
          <input
            value={values.name}
            aria-invalid={errors.name ? true : undefined}
            onChange={(event) => set('name', event.target.value)}
          />
          {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
        </label>

        <label className={styles.field}>
          <span>Nivel de formación</span>
          <select
            value={values.training_level}
            aria-invalid={errors.training_level ? true : undefined}
            onChange={(event) => set('training_level', event.target.value as TrainingLevel | '')}
          >
            <option value="">Selecciona un nivel</option>
            {TRAINING_LEVELS.map((level) => (
              <option key={level} value={level}>{TRAINING_LEVEL_LABELS[level]}</option>
            ))}
          </select>
          {errors.training_level && <span className={styles.fieldError}>{errors.training_level}</span>}
        </label>

        <label className={styles.field}>
          <span>Horas totales</span>
          <input
            inputMode="numeric"
            value={values.total_hours}
            aria-invalid={errors.total_hours ? true : undefined}
            onChange={(event) => set('total_hours', event.target.value)}
          />
          {errors.total_hours && <span className={styles.fieldError}>{errors.total_hours}</span>}
        </label>

        {error && <div className={styles.errorBox} role="alert">{error.message}</div>}

        <div className={styles.actions}>
          <button className={styles.secondaryButton} type="button" onClick={onClose}>Cancelar</button>
          <button className={styles.primaryButton} type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando…' : program ? 'Guardar cambios' : 'Guardar programa'}
          </button>
        </div>
      </form>
    </Modal>
  );
}