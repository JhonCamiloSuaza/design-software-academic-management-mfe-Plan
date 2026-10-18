import { useState } from 'react';

import { ProgramsPage } from '../adapter/in/pages/ProgramsPage.js';
import {
  createInMemoryProgramsApi,
  type PreviewScenario,
  type PreviewState,
  type WritesState,
} from './inMemoryProgramsApi.js';
import styles from './ProgramsPreview.module.css';

const READ_OPTIONS: Array<{ value: PreviewState; label: string }> = [
  { value: 'ok', label: 'Con datos' },
  { value: 'slow', label: 'Cargando (4 s)' },
  { value: 'empty', label: 'Sin resultados' },
  { value: 'error', label: 'Error' },
];

const WRITE_OPTIONS: Array<{ value: WritesState; label: string }> = [
  { value: 'ok', label: 'Funciona' },
  { value: 'error', label: 'Falla' },
];

/**
 * Vista previa navegable de ProgramsPage con datos simulados en memoria.
 * Solo para revision (QA / demo): no llama al backend.
 */
export function ProgramsPreview() {
  const [preview] = useState(() => createInMemoryProgramsApi());
  const [scenario, setScenario] = useState<PreviewScenario>({ ...preview.scenario });
  const [canManage, setCanManage] = useState(true);
  const [runKey, setRunKey] = useState(0);

  // Cambiar de escenario remonta la pantalla para que vuelva a consultar.
  const change = (patch: Partial<PreviewScenario>) => {
    preview.setScenario(patch);
    setScenario((current) => ({ ...current, ...patch }));
    setRunKey((key) => key + 1);
  };

  // "Falla al guardar" solo se usa en la proxima accion: no hace falta remontar.
  const changeWrites = (writes: WritesState) => {
    preview.setScenario({ writes });
    setScenario((current) => ({ ...current, writes }));
  };

  const reset = () => {
    preview.reset();
    setRunKey((key) => key + 1);
  };

  return (
    <>
      <div className={styles.bar} role="region" aria-label="Controles de la vista previa">
        <div className={styles.title}>
          <strong>Vista previa HU-ACAD-17</strong>
          <span>Datos simulados en memoria · no llama al backend</span>
        </div>

        <label className={styles.field}>
          <span>Listado de programas</span>
          <select value={scenario.list} onChange={(e) => change({ list: e.target.value as PreviewState })}>
            {READ_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Competencias y RAP</span>
          <select value={scenario.tree} onChange={(e) => change({ tree: e.target.value as PreviewState })}>
            {READ_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Crear / editar / dar de baja</span>
          <select value={scenario.writes} onChange={(e) => changeWrites(e.target.value as WritesState)}>
            {WRITE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={canManage}
            onChange={(e) => {
              setCanManage(e.target.checked);
              setRunKey((key) => key + 1);
            }}
          />
          <span>Puede gestionar</span>
        </label>

        <button type="button" className={styles.reset} onClick={reset}>
          Restablecer datos
        </button>
      </div>

      <ProgramsPage key={runKey} api={preview.api} canManage={canManage} />
    </>
  );
}