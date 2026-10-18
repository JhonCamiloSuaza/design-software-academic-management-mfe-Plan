import type { Ficha, FichasPageResult, ListFichasQuery } from '../../domain/ficha.js';

export interface FichasApi {
  list(query: ListFichasQuery, signal?: AbortSignal): Promise<FichasPageResult>;
  getById(id: string, signal?: AbortSignal): Promise<Ficha>;
}
