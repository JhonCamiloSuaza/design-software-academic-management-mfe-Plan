import { useCallback, useEffect, useState } from 'react';

import type { FichasApi } from './ports/FichasApi.js';
import type { Ficha } from '../domain/ficha.js';

export function useFichaDetail(api: FichasApi, id?: string) {
  const [data, setData] = useState<Ficha | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) {
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    void api
      .getById(id, controller.signal)
      .then(setData)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause : new Error('Error inesperado al consultar la ficha.'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [api, id, reloadKey]);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);

  return { data, isLoading, error, retry };
}
