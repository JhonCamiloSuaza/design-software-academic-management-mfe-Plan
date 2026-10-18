import type { FichasApi } from '../../../application/ports/FichasApi.js';
import type {
  ContractFicha,
  Ficha,
  FichasPageResult,
  ListFichasQuery,
} from '../../../domain/ficha.js';

interface ContractPage {
  data: Array<Omit<ContractFicha, 'status'> & { status: string }>;
  pagination: FichasPageResult['pagination'];
}

export class HttpFichasApi implements FichasApi {
  private readonly baseUrl: string;

  constructor(baseUrl = '/api/v1') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async list(query: ListFichasQuery, signal?: AbortSignal): Promise<FichasPageResult> {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
    });

    const response = await fetch(`${this.baseUrl}/fichas?${params.toString()}`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
      signal,
    });

    return this.parseResponse<ContractPage>(response);
  }

  async getById(id: string, signal?: AbortSignal): Promise<Ficha> {
    const response = await fetch(`${this.baseUrl}/fichas/${encodeURIComponent(id)}`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
      signal,
    });

    return this.parseResponse<Ficha>(response);
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new Error(`No fue posible consultar las fichas (HTTP ${response.status}).`);
    }

    return response.json() as Promise<T>;
  }
}
