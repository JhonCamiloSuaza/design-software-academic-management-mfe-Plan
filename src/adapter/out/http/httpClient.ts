export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ErrorBody {
  error?: { message?: string };
}

export const toQueryString = (query: object): string => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });

  const text = params.toString();
  return text ? `?${text}` : '';
};

// El contrato devuelve { error: { code, message } }; el mensaje ya viene en español (E5).
async function errorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ErrorBody;
    if (body.error?.message) return body.error.message;
  } catch {
    // cuerpo vacío o no JSON: se usa el mensaje genérico
  }

  return `No fue posible completar la operación (HTTP ${response.status}).`;
}

export async function requestJson<T>(
  baseUrl: string,
  method: HttpMethod,
  path: string,
  options: { body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const hasBody = options.body !== undefined;
  if (hasBody) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: hasBody ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (!response.ok) throw new Error(await errorMessage(response));
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}
