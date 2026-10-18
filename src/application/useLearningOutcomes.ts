import { useCallback, useEffect, useState } from 'react';

import type { TrainingProgramsApi } from './ports/TrainingProgramsApi.js';
import type { LearningOutcome, ListLearningOutcomesQuery, Page } from '../domain/trainingProgram.js';

const OUTCOMES_QUERY: ListLearningOutcomesQuery = { page: 1, page_size: 100 };
const NO_OUTCOMES: LearningOutcome[] = [];

// E4: RAP de una competencia. Solo consulta cuando hay competencyId (al expandir).
export function useLearningOutcomes(api: TrainingProgramsApi, competencyId?: string) {
  const [result, setResult] = useState<Page<LearningOutcome> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!competencyId) {
      setResult(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    void api
      .listLearningOutcomes(competencyId, OUTCOMES_QUERY, controller.signal)
      .then(setResult)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause : new Error('Error inesperado al consultar los RAP.'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [api, competencyId, reloadKey]);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);

  return { data: result?.data ?? NO_OUTCOMES, pagination: result?.pagination, isLoading, error, retry };
}