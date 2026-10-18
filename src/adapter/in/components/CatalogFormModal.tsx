import { type FormEvent, useId, useState } from 'react';

import {
  type CatalogFormErrors,
  type CatalogFormValues,
  validateCatalogForm,
} from '../../../domain/curriculum.js';
import ui from './components.module.css';
import { Modal } from './Modal.js';

export interface ParentOption {
  id: string;
  name: string;
}

interface ParentConfig {
  label: string;
  requiredMessage: string;
  options: ParentOption[];
  loadError: Error | null;
}

interface Props {
  title: string;
  hint?: string;
  submitLabel: string;
  initial: CatalogFormValues;
  parent?: ParentConfig; // las líneas tecnológicas no tienen padre
  isSaving: boolean;
  error: Error | null;
  onSubmit(values: CatalogFormValues): void;
  onClose(): void;
}

// Formulario común: línea (E1), red tecnológica (E2) y red de conocimiento (E3).
export function CatalogFormModal({ title, hint, submitLabel, initial, parent, isSaving, error, onSubmit, onClose }: Props) {
  const titleId = useId();
  const [values, setValues] = useState<CatalogFormValues>(initial);
  const [errors, setErrors] = useState<CatalogFormErrors>({});

  const set = <K extends keyof CatalogFormValues>(key: K, value: CatalogFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateCatalogForm(values, parent?.requiredMessage);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(values);
  };

  const hasCurrentParent = parent?.options.some((option) => option.id === values.parent_id) ?? false;

  return (
    <Modal labelledBy={titleId} onClose={onClose}>
      <h2 id={titleId}>{title}</h2>
      {hint && <p className={ui.hint}>{hint}</p>}

      <form className={ui.form} onSubmit={handleSubmit} noValidate>
        <label className={ui.field}>
          <span>Código</span>
          <input value={values.code} onChange={(event) => set('code', event.target.value)} />
          {errors.code && <span className={ui.fieldError}>{errors.code}</span>}
        </label>

        <label className={ui.field}>
          <span>Nombre</span>
          <input value={values.name} onChange={(event) => set('name', event.target.value)} />
          {errors.name && <span className={ui.fieldError}>{errors.name}</span>}
        </label>

        {parent && (
          <label className={ui.field}>
            <span>{parent.label}</span>
            <select value={values.parent_id} onChange={(event) => set('parent_id', event.target.value)}>
              <option value="">Selecciona una opción</option>
              {values.parent_id && !hasCurrentParent && (
                <option value={values.parent_id}>Valor actual</option>
              )}
              {parent.options.map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
            {parent.loadError && (
              <span className={ui.fieldError}>No pudimos cargar las opciones de {parent.label.toLowerCase()}.</span>
            )}
            {errors.parent_id && <span className={ui.fieldError}>{errors.parent_id}</span>}
          </label>
        )}

        <label className={ui.field}>
          <span>Estado</span>
          <select
            value={values.is_active ? 'ACTIVE' : 'INACTIVE'}
            onChange={(event) => set('is_active', event.target.value === 'ACTIVE')}
          >
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
          </select>
        </label>

        {error && <div className={ui.errorBox} role="alert">{error.message}</div>}

        <div className={ui.actions}>
          <button className={ui.secondaryButton} type="button" onClick={onClose}>Cancelar</button>
          <button className={ui.primaryButton} type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando…' : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}