import { useCallback, useMemo } from 'react';

import type {
  KnowledgeNetwork,
  KnowledgeNetworkCreate,
  KnowledgeNetworkUpdate,
} from '../domain/curriculum.js';
import type { CurriculumApi } from './ports/CurriculumApi.js';
import { useCatalog } from './useCatalog.js';

export interface UseKnowledgeNetworkCatalogOptions {
  page?: number;
  pageSize?: number;
  techNetworkId?: string;
  isActive?: boolean;
}

// E3: redes de conocimiento (opcionalmente filtradas por red tecnológica).
export function useKnowledgeNetworkCatalog(api: CurriculumApi, options: UseKnowledgeNetworkCatalogOptions = {}) {
  const { page = 1, pageSize = 100, techNetworkId, isActive } = options;

  const load = useCallback(
    (signal: AbortSignal) =>
      api.listKnowledgeNetworks(
        { page, page_size: pageSize, tech_network_id: techNetworkId, is_active: isActive },
        signal,
      ),
    [api, page, pageSize, techNetworkId, isActive],
  );
  const actions = useMemo(
    () => ({
      create: (body: KnowledgeNetworkCreate) => api.createKnowledgeNetwork(body),
      update: (id: string, body: KnowledgeNetworkUpdate) => api.updateKnowledgeNetwork(id, body),
      deactivate: (id: string) => api.deactivateKnowledgeNetwork(id),
    }),
    [api],
  );

  return useCatalog<KnowledgeNetwork, KnowledgeNetworkCreate, KnowledgeNetworkUpdate>(load, actions);
}
