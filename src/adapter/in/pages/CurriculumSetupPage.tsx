import { useState } from 'react';

import type { CurriculumApi } from '../../../application/ports/CurriculumApi.js';
import ui from '../components/components.module.css';
import tree from '../components/curriculum.module.css';
import { KnowledgeTab, LinesTab, NetworksTab } from '../components/CurriculumTabs.js';
import styles from './CurriculumSetupPage.module.css';

interface Props {
  api: CurriculumApi;
  // ACADEMIC_PROGRAM_MANAGE: si el usuario no lo tiene, se ocultan los botones de escritura.
  canManage?: boolean;
}

type TabId = 'LINES' | 'NETWORKS' | 'KNOWLEDGE';

const TABS: ReadonlyArray<{ id: TabId; label: string }> = [
  { id: 'LINES', label: 'Líneas' },
  { id: 'NETWORKS', label: 'Redes tecnológicas' },
  { id: 'KNOWLEDGE', label: 'Redes de conocimiento' },
];

// HU-ACAD-18: parametrización de currículo (línea → red tecnológica → red de conocimiento).
export function CurriculumSetupPage({ api, canManage = true }: Props) {
  const [tab, setTab] = useState<TabId>('LINES');

  return (
    <main className={styles.root} data-mfe="academic-management">
      <header className={styles.pageHeader}>
        <div>
          <h1>Parametrización — Currículo académico</h1>
          <p>
            Jerarquía curricular: línea → red tecnológica → red de conocimiento. Es el prerrequisito para crear
            programas de formación.
          </p>
        </div>
      </header>

      <section className={styles.panel}>
        <div className={tree.tabs} role="tablist" aria-label="Niveles del currículo">
          {TABS.map((item) => (
            <button
              key={item.id}
              id={`curriculum-tab-${item.id}`}
              className={tree.tab}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              aria-controls="curriculum-panel"
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className={ui.hint}>
          Antes de dar de baja un nivel, revisa de cuál depende: si está en uso por un programa de formación activo,
          el servidor bloquea la baja y mostramos su mensaje.
        </p>

        <div id="curriculum-panel" role="tabpanel" aria-labelledby={`curriculum-tab-${tab}`}>
          {tab === 'LINES' && <LinesTab api={api} canManage={canManage} />}
          {tab === 'NETWORKS' && <NetworksTab api={api} canManage={canManage} />}
          {tab === 'KNOWLEDGE' && <KnowledgeTab api={api} canManage={canManage} />}
        </div>
      </section>
    </main>
  );
}

export default CurriculumSetupPage;
