import { useCallback, useEffect, useMemo, useState } from 'react';

import type { TrainingProgramsApi } from './ports/TrainingProgramsApi.js';
import type {
  ListTrainingProgramsQuery,
  TrainingLevel,
  TrainingProgram,
  TrainingProgramCreate,
  TrainingProgramUpdate,
  TrainingProgramsPageResult,
} from '../domain/trainingProgram.js';

export interface UseTrainingProgramsOptions {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
  trainingLevel?: TrainingLevel;
  programCode?: string;
}

const NO_PROGRAMS: TrainingProgram[] = [];

export function buildProgramsQuery(options: UseTrainingProgramsOptions): ListTrainingProgramsQuery {
  return {
    page: options.page ?? 1,
    page_size: options.pageSize ?? 10,
    is_active: options.isActive,
    training_level: options.trainingLevel,
    program_code: options.programCode || undefined,
  };
}

// E1, E2, E5: lista paginada + crear, editar y dar de baja (baja lógica).
export function useTrainingPrograms(api: TrainingProgramsApi, options: UseTrainingProgramsOptions = {}) {
  const [result, setResult] = useState<TrainingProgramsPageResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<Error | null>(null);
  const query = useMemo(
    () => buildProgramsQuery(options),
    [options.isActive, options.page, options.pageSize, options.programCode, options.trainingLevel],
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
          setError(cause instanceof Error ? cause : new Error('Error inesperado al consultar programas.'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [api, query, reloadKey]);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);
  const clearActionError = useCallback(() => setActionError(null), []);

  const mutate = useCallback(async (action: () => Promise<unknown>): Promise<boolean> => {
    setIsSaving(true);
    setActionError(null);
    try {
      await action();
      setReloadKey((key) => key + 1);
      return true;
    } catch (cause) {
      setActionError(cause instanceof Error ? cause : new Error('Error inesperado al guardar.'));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const create = useCallback((body: TrainingProgramCreate) => mutate(() => api.create(body)), [api, mutate]);
  const update = useCallback(
    (id: string, body: TrainingProgramUpdate) => mutate(() => api.update(id, body)),
    [api, mutate],
  );
  const deactivate = useCallback((id: string) => mutate(() => api.deactivate(id)), [api, mutate]);

  return {
    data: result?.data ?? NO_PROGRAMS,
    pagination: result?.pagination,
    isLoading,
    error,
    retry,
    query,
    isSaving,
    actionError,
    clearActionError,
    create,
    update,
    deactivate,
  };
}