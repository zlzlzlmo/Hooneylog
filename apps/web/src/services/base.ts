/**
 * 💡 업계 표준: Base API Service
 * 모든 API 서비스의 공통 로직(fetch, 에러 핸들링, 파싱 등)을 추상화합니다.
 */
export class BaseApiService {
  protected async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'API Request Failed' }));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    // 응답이 없는 경우(204 No Content 등)를 대비한 처리
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  protected get<T>(path: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  protected post<T>(path: string, body?: unknown, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  protected put<T>(path: string, body?: unknown, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  protected delete<T>(path: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}
