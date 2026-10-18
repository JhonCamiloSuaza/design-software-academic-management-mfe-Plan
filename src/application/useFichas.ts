import { useCallback, useEffect, useMemo, useState } from 'react';

import type { FichasApi } from './ports/FichasApi.js';
import type { FichaStatus, FichasPageResult, ListFichasQuery } from '../domain/ficha.js';

export interface FichasFilters {
  programId?: string;
  status?: FichaStatus;
  activeOnly?: boolean;
}

export interface UseFichasOptions extends FichasFilters {
  page?: number;
  pageSize?: number;
  sort?: string;
}

export function buildFichasQuery(options: UseFichasOptions): ListFichasQuery {
  return {
    page: options.page ?? 1,
    page_size: options.pageSize ?? 10,
    sort: options.sort ?? 'start_date:desc',
    program_id: options.programId || undefined,
    status: options.activeOnly ? 'EXECUTION' : options.status,
  };
}

export function useFichas(api: FichasApi, options: UseFichasOptions = {}) {
  const [result, setResult] = useState<FichasPageResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const query = useMemo(
    () => buildFichasQuery(options),
    [
      options.activeOnly,
      options.page,
      options.pageSize,
      options.programId,
      options.sort,
      options.status,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    void api
      .list(query, controller.signal)
      .then(setResult)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause : new Error('Error inesperado al consultar fichas.'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [api, query, reloadKey]);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);

  return { data: result?.data ?? [], pagination: result?.pagination, isLoading, error, retry, query };
}
