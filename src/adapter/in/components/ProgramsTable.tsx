import {
  canEditProgram,
  getTrainingLevelLabel,
  type TrainingProgram,
} from '../../../domain/trainingProgram.js';
import styles from './components.module.css';
import { ProgramActiveBadge } from './ProgramActiveBadge.js';

interface Props {
  programs: TrainingProgram[];
  networkNames: ReadonlyMap<string, string>;
  selectedId?: string;
  canManage: boolean;
  onSelect(program: TrainingProgram): void;
  onEdit(program: TrainingProgram): void;
  onDeactivate(program: TrainingProgram): void;
}

// E1: tabla de programas. E2: muestra la versión vigente. E5: estado y baja.
export function ProgramsTable({ programs, networkNames, selectedId, canManage, onSelect, onEdit, onDeactivate }: Props) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table} aria-label="Programas de formación">
        <thead>
          <tr>
            <th>Código</th>
            <th>Programa</th>
            <th>Red de conocimiento</th>
            <th>Nivel</th>
            <th>Horas</th>
            <th>Versión</th>
            <th>Estado</th>
            {canManage && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {programs.map((program) => (
            <tr key={program.id} data-selected={String(program.id === selectedId)}>
              <td data-label="Código">{program.program_code}</td>
              <td data-label="Programa">
                <button className={styles.linkButton} type="button" aria-current={program.id === selectedId ? 'true' : undefined} onClick={() => onSelect(program)}>
                  {program.name}
                </button>
              </td>
              <td data-label="Red de conocimiento">{networkNames.get(program.knowledge_network_id) ?? '—'}</td>
              <td data-label="Nivel">{getTrainingLevelLabel(program.training_level)}</td>
              <td data-label="Horas">{program.total_hours} h</td>
              <td data-label="Versión">v{program.version}</td>
              <td data-label="Estado"><ProgramActiveBadge isActive={program.is_active} /></td>
              {canManage && (
                <td data-label="Acciones">
                  <div className={styles.rowActions}>
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      aria-label={`Editar ${program.program_code}`}
                      disabled={!canEditProgram(program)}
                      onClick={() => onEdit(program)}
                    >
                      Editar
                    </button>
                    <button
                      className={styles.dangerButton}
                      type="button"
                      aria-label={`Dar de baja ${program.program_code}`}
                      disabled={!program.is_active}
                      onClick={() => onDeactivate(program)}
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
  );
}