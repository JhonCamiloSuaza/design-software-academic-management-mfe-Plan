import { useCallback, useEffect, useState } from 'react';

import type { TrainingProgramsApi } from './ports/TrainingProgramsApi.js';
import type { Competency, CompetencyCreate, ListCompetenciesQuery, Page } from '../domain/trainingProgram.js';

const COMPETENCIES_QUERY: ListCompetenciesQuery = { page: 1, page_size: 100 };
const NO_COMPETENCIES: Competency[] = [];

// E3: listar y crear competencias de un programa.
export function useProgramCompetencies(api: TrainingProgramsApi, programId?: string) {
  const [result, setResult] = useState<Page<Competency> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<Error | null>(null);

  useEffect(() => {
    if (!programId) {
      setResult(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    void api
      .listCompetencies(programId, COMPETENCIES_QUERY, controller.signal)
      .then(setResult)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause : new Error('Error inesperado al consultar competencias.'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [api, programId, reloadKey]);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);
  const clearActionError = useCallback(() => setActionError(null), []);

  const create = useCallback(
    async (body: CompetencyCreate): Promise<boolean> => {
      if (!programId) return false;
      setIsSaving(true);
      setActionError(null);
      try {
        await api.createCompetency(programId, body);
        setReloadKey((key) => key + 1);
        return true;
      } catch (cause) {
        setActionError(cause instanceof Error ? cause : new Error('Error inesperado al crear la competencia.'));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [api, programId],
  );

  return {
    data: result?.data ?? NO_COMPETENCIES,
    pagination: result?.pagination,
    isLoading,
    error,
    retry,
    isSaving,
    actionError,
    clearActionError,
    create,
  };
}