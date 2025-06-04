// API設定
export const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://estimate-system-production.up.railway.app' 
    : 'http://localhost:3001',
  endpoints: {
    health: '/api/health',
    auth: {
      google: '/api/auth/google',
      me: '/api/auth/me',
      testLogin: '/api/auth/test-login',
      logout: '/api/auth/logout'
    },
    clients: '/api/clients',
    items: '/api/items',
    estimates: '/api/estimates'
  }
};

// ヘルパー関数
export const getApiUrl = (endpoint: string) => `${API_CONFIG.baseURL}${endpoint}`;

// APIリクエスト用のヘルパー
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // タイムアウトを15秒に設定
    signal: AbortSignal.timeout(15000),
  };

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`API Request (attempt ${attempt}): ${config.method || 'GET'} ${getApiUrl(endpoint)}`);
      
      const response = await fetch(getApiUrl(endpoint), config);
      
      console.log(`API Response: ${response.status} ${response.statusText}`);
      
      // 成功の場合はそのまま返す
      if (response.ok || attempt === maxRetries) {
        return response;
      }
      
      // 5xx エラーの場合のみリトライ
      if (response.status >= 500 && attempt < maxRetries) {
        console.log(`Retrying due to server error (${response.status})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // 指数バックオフ
        continue;
      }
      
      return response;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`API Request failed (attempt ${attempt}):`, lastError);
      
      // ネットワークエラーまたはタイムアウト エラーの場合のみリトライ
      if (attempt < maxRetries && (
        error instanceof TypeError || 
        (error instanceof Error && error.name === 'AbortError')
      )) {
        console.log(`Retrying due to network error...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}; 