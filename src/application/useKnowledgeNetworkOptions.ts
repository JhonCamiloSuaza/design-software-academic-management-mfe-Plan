import { useEffect, useState } from 'react';

import type { TrainingProgramsApi } from './ports/TrainingProgramsApi.js';
import type { KnowledgeNetwork, ListKnowledgeNetworksQuery } from '../domain/trainingProgram.js';

const NETWORKS_QUERY: ListKnowledgeNetworksQuery = { page: 1, page_size: 100, is_active: true };
const NO_NETWORKS: KnowledgeNetwork[] = [];

// Selector de red de conocimiento del formulario de programa (knowledge_network_id es obligatorio).
export function useKnowledgeNetworkOptions(api: TrainingProgramsApi) {
  const [data, setData] = useState<KnowledgeNetwork[]>(NO_NETWORKS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    void api
      .listKnowledgeNetworks(NETWORKS_QUERY, controller.signal)
      .then((page) => setData(page.data))
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause : new Error('Error inesperado al consultar redes.'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [api]);

  return { data, isLoading, error };
}
