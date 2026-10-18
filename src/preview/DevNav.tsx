import styles from './DevNav.module.css';

export const PROGRAMS_PREVIEW_HASH = '#/preview/programas';
export const CURRICULUM_PREVIEW_HASH = '#/preview/curriculo';

export type PreviewView = 'fichas' | 'curriculo' | 'programas';

interface Props {
  active: PreviewView;
}

/** Menu lateral de las vistas locales (solo en `npm run dev`; no forma parte de lo que expone el MFE). */
export function DevNav({ active }: Props) {
  const current = (view: PreviewView) => (active === view ? 'page' : undefined);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandMark} aria-hidden="true">SENA</span>
        <span className={styles.brandCopy}>
          <strong>Gestión de Horarios</strong>
          <span>Vistas locales · desarrollo</span>
        </span>
      </div>

      <nav className={styles.nav} aria-label="Vistas locales de desarrollo">
        <p className={styles.label}>Academic management</p>
        <a className={styles.link} href="#/" aria-current={current('fichas')}>
          Fichas
        </a>
        <a className={styles.link} href={CURRICULUM_PREVIEW_HASH} aria-current={current('curriculo')}>
          Currículo académico
        </a>
        <a className={styles.link} href={PROGRAMS_PREVIEW_HASH} aria-current={current('programas')}>
          Programas y competencias
        </a>
      </nav>

      <p className={styles.note}>
        Fichas: HU-ACAD-16 (sin backend responde 404). Currículo académico: HU-ACAD-18. Programas y competencias:
        HU-ACAD-17. Las dos últimas son vistas previas con datos simulados.
      </p>
    </aside>
  );
}