import type { CurriculumApi } from '../../../application/ports/CurriculumApi.js';
import type {
  KnowledgeNetwork,
  KnowledgeNetworkCreate,
  KnowledgeNetworkUpdate,
  ListKnowledgeNetworksQuery,
  ListTechLinesQuery,
  ListTechNetworksQuery,
  Page,
  TechLine,
  TechLineCreate,
  TechLineUpdate,
  TechNetwork,
  TechNetworkCreate,
  TechNetworkUpdate,
} from '../../../domain/curriculum.js';
import { type HttpMethod, requestJson, toQueryString } from './httpClient.js';

const seg = (id: string) => encodeURIComponent(id);

export class HttpCurriculumApi implements CurriculumApi {
  private readonly baseUrl: string;

  constructor(baseUrl = '/api/v1') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  // E1
  listTechLines(query: ListTechLinesQuery, signal?: AbortSignal): Promise<Page<TechLine>> {
    return this.send('GET', `/tech-lines${toQueryString(query)}`, { signal });
  }
  createTechLine(body: TechLineCreate): Promise<TechLine> {
    return this.send('POST', '/tech-lines', { body });
  }
  updateTechLine(id: string, body: TechLineUpdate): Promise<TechLine> {
    return this.send('PUT', `/tech-lines/${seg(id)}`, { body });
  }
  deactivateTechLine(id: string): Promise<void> {
    return this.send('DELETE', `/tech-lines/${seg(id)}`);
  }

  // E2
  listTechNetworks(query: ListTechNetworksQuery, signal?: AbortSignal): Promise<Page<TechNetwork>> {
    return this.send('GET', `/tech-networks${toQueryString(query)}`, { signal });
  }
  createTechNetwork(body: TechNetworkCreate): Promise<TechNetwork> {
    return this.send('POST', '/tech-networks', { body });
  }
  updateTechNetwork(id: string, body: TechNetworkUpdate): Promise<TechNetwork> {
    return this.send('PUT', `/tech-networks/${seg(id)}`, { body });
  }
  deactivateTechNetwork(id: string): Promise<void> {
    return this.send('DELETE', `/tech-networks/${seg(id)}`);
  }

  // E3
  listKnowledgeNetworks(query: ListKnowledgeNetworksQuery, signal?: AbortSignal): Promise<Page<KnowledgeNetwork>> {
    return this.send('GET', `/knowledge-networks${toQueryString(query)}`, { signal });
  }
  createKnowledgeNetwork(body: KnowledgeNetworkCreate): Promise<KnowledgeNetwork> {
    return this.send('POST', '/knowledge-networks', { body });
  }
  updateKnowledgeNetwork(id: string, body: KnowledgeNetworkUpdate): Promise<KnowledgeNetwork> {
    return this.send('PUT', `/knowledge-networks/${seg(id)}`, { body });
  }
  deactivateKnowledgeNetwork(id: string): Promise<void> {
    return this.send('DELETE', `/knowledge-networks/${seg(id)}`);
  }

  private send<T>(
    method: HttpMethod,
    path: string,
    options: { body?: unknown; signal?: AbortSignal } = {},
  ): Promise<T> {
    return requestJson<T>(this.baseUrl, method, path, options);
  }
}
