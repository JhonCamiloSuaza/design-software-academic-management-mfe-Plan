import { useCallback, useMemo } from 'react';

import type { TechLine, TechLineCreate, TechLineUpdate } from '../domain/curriculum.js';
import type { CurriculumApi } from './ports/CurriculumApi.js';
import { useCatalog } from './useCatalog.js';

export interface UseTechLinesOptions {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
}

// E1: listar, crear, editar y dar de baja líneas tecnológicas.
export function useTechLines(api: CurriculumApi, options: UseTechLinesOptions = {}) {
  const { page = 1, pageSize = 100, isActive } = options;

  const load = useCallback(
    (signal: AbortSignal) => api.listTechLines({ page, page_size: pageSize, is_active: isActive }, signal),
    [api, page, pageSize, isActive],
  );
  const actions = useMemo(
    () => ({
      create: (body: TechLineCreate) => api.createTechLine(body),
      update: (id: string, body: TechLineUpdate) => api.updateTechLine(id, body),
      deactivate: (id: string) => api.deactivateTechLine(id),
    }),
    [api],
  );

  return useCatalog<TechLine, TechLineCreate, TechLineUpdate>(load, actions);
}
