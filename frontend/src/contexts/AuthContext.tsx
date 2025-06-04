import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getApiUrl, apiRequest } from '../config/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  testLogin: (email: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 初期化時に認証状態をチェック
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // トークンがある場合、サーバーに認証状態を確認
        console.log('Checking auth status with token...');
        const response = await apiRequest('/api/auth/me');
        
        if (response.ok) {
          const userData = await response.json();
          console.log('Auth check successful:', userData);
          setUser(userData);
        } else {
          console.log('Auth check failed, removing token');
          localStorage.removeItem('authToken');
        }
      } else {
        console.log('No auth token found');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    // Google OAuth ログインページにリダイレクト
    window.location.href = getApiUrl('/api/auth/google');
  };

  const testLogin = async (email: string, name: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting test login with:', { email, name });
      
      const response = await apiRequest('/api/auth/test-login', {
        method: 'POST',
        body: JSON.stringify({ email, name })
      });

      console.log('Login response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        localStorage.setItem('authToken', data.token);
        setUser(data.user);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Login failed with status:', response.status, errorData);
        
        // エラーの種類に応じて適切なメッセージを表示
        let errorMessage = 'ログインに失敗しました';
        if (response.status === 503) {
          errorMessage = 'データベースサービスが利用できません。しばらく時間をおいて再度お試しください。';
        } else if (response.status === 500) {
          errorMessage = 'サーバーエラーが発生しました。管理者にお問い合わせください。';
        } else if (response.status === 400) {
          errorMessage = '入力データが不正です。';
        } else if (response.status >= 400 && response.status < 500) {
          errorMessage = 'リクエストエラーが発生しました。';
        }
        
        throw new Error(errorData.error || errorMessage);
      }
    } catch (error) {
      console.error('Test login failed:', error);
      
      // ネットワークエラーの場合
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('ネットワークエラーが発生しました。インターネット接続を確認してください。');
      }
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('予期しないエラーが発生しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('authToken');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    testLogin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 