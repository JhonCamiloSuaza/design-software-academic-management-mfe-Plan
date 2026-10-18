import { useCallback, useEffect, useState } from 'react';

import type { Page } from '../domain/curriculum.js';

export interface CatalogActions<C, U> {
  create(body: C): Promise<unknown>;
  update(id: string, body: U): Promise<unknown>;
  deactivate(id: string): Promise<void>;
}

export interface CatalogState<T, C, U> {
  data: T[];
  pagination: Page<T>['pagination'] | undefined;
  isLoading: boolean;
  error: Error | null;
  retry(): void;
  isSaving: boolean;
  actionError: Error | null;
  clearActionError(): void;
  create(body: C): Promise<boolean>;
  update(id: string, body: U): Promise<boolean>;
  deactivate(id: string): Promise<boolean>;
}

const NO_ITEMS: never[] = [];

// `load` y `actions` deben ser referencias estables (useCallback / useMemo en el hook que lo usa).
export function useCatalog<T, C, U>(
  load: (signal: AbortSignal) => Promise<Page<T>>,
  actions: CatalogActions<C, U>,
): CatalogState<T, C, U> {
  const [result, setResult] = useState<Page<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    void load(controller.signal)
      .then(setResult)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause : new Error('Error inesperado al consultar el currículo.'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [load, reloadKey]);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);
  const clearActionError = useCallback(() => setActionError(null), []);

  // E5: si el backend rechaza (p. ej. 409 por nivel en uso), el mensaje queda en actionError.
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

  const create = useCallback((body: C) => mutate(() => actions.create(body)), [actions, mutate]);
  const update = useCallback((id: string, body: U) => mutate(() => actions.update(id, body)), [actions, mutate]);
  const deactivate = useCallback((id: string) => mutate(() => actions.deactivate(id)), [actions, mutate]);

  const data: T[] = result?.data ?? NO_ITEMS;

  return {
    data,
    pagination: result?.pagination,
    isLoading,
    error,
    retry,
    isSaving,
    actionError,
    clearActionError,
    create,
    update,
    deactivate,
  };
}
