import { useCallback, useMemo } from 'react';

import type { TechNetwork, TechNetworkCreate, TechNetworkUpdate } from '../domain/curriculum.js';
import type { CurriculumApi } from './ports/CurriculumApi.js';
import { useCatalog } from './useCatalog.js';

export interface UseTechNetworksOptions {
  page?: number;
  pageSize?: number;
  techLineId?: string;
  isActive?: boolean;
}

// E2: redes tecnológicas (opcionalmente filtradas por línea).
export function useTechNetworks(api: CurriculumApi, options: UseTechNetworksOptions = {}) {
  const { page = 1, pageSize = 100, techLineId, isActive } = options;

  const load = useCallback(
    (signal: AbortSignal) =>
      api.listTechNetworks(
        { page, page_size: pageSize, tech_line_id: techLineId, is_active: isActive },
        signal,
      ),
    [api, page, pageSize, techLineId, isActive],
  );
  const actions = useMemo(
    () => ({
      create: (body: TechNetworkCreate) => api.createTechNetwork(body),
      update: (id: string, body: TechNetworkUpdate) => api.updateTechNetwork(id, body),
      deactivate: (id: string) => api.deactivateTechNetwork(id),
    }),
    [api],
  );

  return useCatalog<TechNetwork, TechNetworkCreate, TechNetworkUpdate>(load, actions);
}
