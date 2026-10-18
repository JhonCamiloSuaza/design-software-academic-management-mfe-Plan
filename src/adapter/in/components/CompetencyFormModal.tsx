import { type FormEvent, useState } from 'react';

import {
  EMPTY_COMPETENCY_FORM,
  validateCompetencyForm,
  type CompetencyFormErrors,
  type CompetencyFormValues,
} from '../../../domain/trainingProgram.js';
import styles from './components.module.css';
import { Modal } from './Modal.js';

interface Props {
  isSaving: boolean;
  error: Error | null;
  onSubmit(values: CompetencyFormValues): void;
  onClose(): void;
}

// E3: crear competencia dentro de un programa.
export function CompetencyFormModal({ isSaving, error, onSubmit, onClose }: Props) {
  const [values, setValues] = useState<CompetencyFormValues>(EMPTY_COMPETENCY_FORM);
  const [errors, setErrors] = useState<CompetencyFormErrors>({});

  const set = (key: keyof CompetencyFormValues, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateCompetencyForm(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(values);
  };

  return (
    <Modal labelledBy="competency-form-title" onClose={onClose}>
      <h2 id="competency-form-title">Nueva competencia</h2>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.field}>
          <span>Código SENA</span>
          <input
            value={values.sena_code}
            aria-invalid={errors.sena_code ? true : undefined}
            onChange={(event) => set('sena_code', event.target.value)}
          />
          {errors.sena_code && <span className={styles.fieldError}>{errors.sena_code}</span>}
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
          <span>Horas</span>
          <input
            inputMode="numeric"
            value={values.hours}
            aria-invalid={errors.hours ? true : undefined}
            onChange={(event) => set('hours', event.target.value)}
          />
          {errors.hours && <span className={styles.fieldError}>{errors.hours}</span>}
        </label>

        {error && <div className={styles.errorBox} role="alert">{error.message}</div>}

        <div className={styles.actions}>
          <button className={styles.secondaryButton} type="button" onClick={onClose}>Cancelar</button>
          <button className={styles.primaryButton} type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando…' : 'Guardar competencia'}
          </button>
        </div>
      </form>
    </Modal>
  );
}