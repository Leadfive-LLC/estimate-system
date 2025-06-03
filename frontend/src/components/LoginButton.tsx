import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginButton: React.FC = () => {
  const { testLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await testLogin('test@example.com', 'テストユーザー');
    } catch (error) {
      console.error('Login failed:', error);
      setError(error instanceof Error ? error.message : 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleTestLogin}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        {isLoading ? 'ログイン中...' : 'テストログイン'}
      </button>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      <div className="text-center">
        <p className="text-sm text-gray-600">
          テスト用アカウントでログインします
          <br />
          <span className="text-xs text-gray-500">
            (test@example.com / テストユーザー)
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginButton; 