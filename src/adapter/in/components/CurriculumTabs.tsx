import { useMemo, useState } from 'react';

import type { CurriculumApi } from '../../../application/ports/CurriculumApi.js';
import { useKnowledgeNetworkCatalog } from '../../../application/useKnowledgeNetworkCatalog.js';
import { useTechLines } from '../../../application/useTechLines.js';
import { useTechNetworks } from '../../../application/useTechNetworks.js';
import {
  type KnowledgeNetwork,
  type TechNetwork,
  toKnowledgeNetworkCreate,
  toKnowledgeNetworkUpdate,
  toTechLineCreate,
  toTechLineUpdate,
  toTechNetworkCreate,
  toTechNetworkUpdate,
} from '../../../domain/curriculum.js';
import { CatalogTab, type ParentConfig } from './CatalogTab.js';

interface TabProps {
  api: CurriculumApi;
  canManage: boolean;
}

const optionOf = (item: { id: string; code: string; name: string; is_active: boolean }) => ({
  id: item.id,
  name: `${item.code} · ${item.name}${item.is_active ? '' : ' (inactiva)'}`,
});

function usePaging() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  return {
    page,
    pageSize,
    onPageChange: setPage,
    onPageSizeChange: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
  };
}

// E1: primer nivel de la jerarquía.
export function LinesTab({ api, canManage }: TabProps) {
  const paging = usePaging();
  const state = useTechLines(api, { page: paging.page, pageSize: paging.pageSize });

  return (
    <CatalogTab
      level="TECH_LINE"
      state={state}
      subtitle="Primer nivel de la jerarquía; agrupan las redes tecnológicas del centro."
      toCreate={toTechLineCreate}
      toUpdate={toTechLineUpdate}
      canManage={canManage}
      {...paging}
    />
  );
}

// E2: segundo nivel. El selector de línea usa el listado de E1 (GET /tech-lines), no valores fijos.
export function NetworksTab({ api, canManage }: TabProps) {
  const paging = usePaging();
  const state = useTechNetworks(api, { page: paging.page, pageSize: paging.pageSize });
  const lines = useTechLines(api);

  const parent = useMemo<ParentConfig<TechNetwork>>(
    () => ({
      label: 'Línea tecnológica',
      requiredMessage: 'Selecciona una línea tecnológica.',
      options: lines.data.map(optionOf),
      loadError: lines.error,
      idOf: (item) => item.tech_line_id,
    }),
    [lines.data, lines.error],
  );

  return (
    <CatalogTab
      level="TECH_NETWORK"
      state={state}
      subtitle="Segundo nivel; cada red tecnológica pertenece a una línea tecnológica."
      parent={parent}
      toCreate={toTechNetworkCreate}
      toUpdate={toTechNetworkUpdate}
      canManage={canManage}
      {...paging}
    />
  );
}

// E3: tercer nivel. El selector usa el listado real de redes tecnológicas.
export function KnowledgeTab({ api, canManage }: TabProps) {
  const paging = usePaging();
  const state = useKnowledgeNetworkCatalog(api, { page: paging.page, pageSize: paging.pageSize });
  const networks = useTechNetworks(api);

  const parent = useMemo<ParentConfig<KnowledgeNetwork>>(
    () => ({
      label: 'Red tecnológica',
      requiredMessage: 'Selecciona una red tecnológica.',
      options: networks.data.map(optionOf),
      loadError: networks.error,
      idOf: (item) => item.tech_network_id,
    }),
    [networks.data, networks.error],
  );

  return (
    <CatalogTab
      level="KNOWLEDGE_NETWORK"
      state={state}
      subtitle="Tercer nivel; cada red de conocimiento pertenece a una red tecnológica."
      parent={parent}
      toCreate={toKnowledgeNetworkCreate}
      toUpdate={toKnowledgeNetworkUpdate}
      canManage={canManage}
      {...paging}
    />
  );
}
