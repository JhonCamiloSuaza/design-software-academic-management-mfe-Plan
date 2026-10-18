import { useEffect, useState } from 'react';

import App from '../App.js';
import { CurriculumPreview } from './CurriculumPreview.js';
import { CURRICULUM_PREVIEW_HASH, DevNav, PROGRAMS_PREVIEW_HASH, type PreviewView } from './DevNav.js';
import styles from './DevRoot.module.css';
import { ProgramsPreview } from './ProgramsPreview.js';

const viewFromHash = (): PreviewView => {
  const hash = window.location.hash;
  if (hash.startsWith(CURRICULUM_PREVIEW_HASH)) return 'curriculo';
  if (hash.startsWith(PROGRAMS_PREVIEW_HASH)) return 'programas';
  return 'fichas';
};

/**
 * Raiz de la app local (npm run dev). Menu lateral con las vistas locales y, a su lado:
 * - por defecto, App (igual que antes);
 * - #/preview/curriculo: HU-ACAD-18 con datos simulados;
 * - #/preview/programas: HU-ACAD-17 con datos simulados.
 * No afecta lo que expone Module Federation.
 */
export function DevRoot() {
  const [view, setView] = useState<PreviewView>(viewFromHash);

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <div className={styles.shell}>
      <DevNav active={view} />
      <div className={styles.main}>
        {view === 'curriculo' && <CurriculumPreview />}
        {view === 'programas' && <ProgramsPreview />}
        {view === 'fichas' && <App />}
      </div>
    </div>
  );
}