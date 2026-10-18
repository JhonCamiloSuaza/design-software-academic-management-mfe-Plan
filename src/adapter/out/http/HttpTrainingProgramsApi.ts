import type { TrainingProgramsApi } from '../../../application/ports/TrainingProgramsApi.js';
import type {
  Competency,
  CompetencyCreate,
  KnowledgeNetwork,
  LearningOutcome,
  ListCompetenciesQuery,
  ListKnowledgeNetworksQuery,
  ListLearningOutcomesQuery,
  ListTrainingProgramsQuery,
  Page,
  TrainingProgram,
  TrainingProgramCreate,
  TrainingProgramUpdate,
  TrainingProgramsPageResult,
} from '../../../domain/trainingProgram.js';

interface ErrorBody {
  error?: { message?: string };
}

const toQueryString = (query: object): string => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });

  const text = params.toString();
  return text ? `?${text}` : '';
};

export class HttpTrainingProgramsApi implements TrainingProgramsApi {
  private readonly baseUrl: string;

  constructor(baseUrl = '/api/v1') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  list(query: ListTrainingProgramsQuery, signal?: AbortSignal): Promise<TrainingProgramsPageResult> {
    return this.request('GET', `/training-programs${toQueryString(query)}`, { signal });
  }

  create(body: TrainingProgramCreate): Promise<TrainingProgram> {
    return this.request('POST', '/training-programs', { body });
  }

  getById(id: string, signal?: AbortSignal): Promise<TrainingProgram> {
    return this.request('GET', `/training-programs/${encodeURIComponent(id)}`, { signal });
  }

  update(id: string, body: TrainingProgramUpdate): Promise<TrainingProgram> {
    return this.request('PUT', `/training-programs/${encodeURIComponent(id)}`, { body });
  }

  deactivate(id: string): Promise<void> {
    return this.request('DELETE', `/training-programs/${encodeURIComponent(id)}`);
  }

  listCompetencies(
    programId: string,
    query: ListCompetenciesQuery,
    signal?: AbortSignal,
  ): Promise<Page<Competency>> {
    return this.request(
      'GET',
      `/training-programs/${encodeURIComponent(programId)}/competencies${toQueryString(query)}`,
      { signal },
    );
  }

  createCompetency(programId: string, body: CompetencyCreate): Promise<Competency> {
    return this.request('POST', `/training-programs/${encodeURIComponent(programId)}/competencies`, { body });
  }

  listLearningOutcomes(
    competencyId: string,
    query: ListLearningOutcomesQuery,
    signal?: AbortSignal,
  ): Promise<Page<LearningOutcome>> {
    return this.request(
      'GET',
      `/competencies/${encodeURIComponent(competencyId)}/learning-outcomes${toQueryString(query)}`,
      { signal },
    );
  }

  listKnowledgeNetworks(
    query: ListKnowledgeNetworksQuery,
    signal?: AbortSignal,
  ): Promise<Page<KnowledgeNetwork>> {
    return this.request('GET', `/knowledge-networks${toQueryString(query)}`, { signal });
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    options: { body?: unknown; signal?: AbortSignal } = {},
  ): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    const hasBody = options.body !== undefined;
    if (hasBody) headers['Content-Type'] = 'application/json';

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      credentials: 'include',
      headers,
      body: hasBody ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });

    if (!response.ok) throw new Error(await this.errorMessage(response));
    if (response.status === 204) return undefined as T;

    return response.json() as Promise<T>;
  }

  // El contrato devuelve { error: { code, message } }; el mensaje ya viene en español.
  private async errorMessage(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as ErrorBody;
      if (body.error?.message) return body.error.message;
    } catch {
      // cuerpo vacío o no JSON: se usa el mensaje genérico
    }

    return `No fue posible completar la operación (HTTP ${response.status}).`;
  }
}