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
  };

  const response = await fetch(getApiUrl(endpoint), config);
  return response;
}; 