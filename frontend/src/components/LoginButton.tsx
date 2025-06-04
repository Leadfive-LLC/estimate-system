import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginButton: React.FC = () => {
  const { testLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleTestLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await testLogin('test@example.com', 'テストユーザー');
      setRetryCount(0); // 成功したらリトライカウントをリセット
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました';
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    handleTestLogin();
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleTestLogin}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ログイン中...
          </>
        ) : 'テストログイン'}
      </button>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
          <p className="text-red-600 text-sm">{error}</p>
          {retryCount > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-red-500 text-xs">試行回数: {retryCount}</p>
              <button
                onClick={handleRetry}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
              >
                再試行
              </button>
            </div>
          )}
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
        {isLoading && (
          <p className="text-xs text-blue-500 mt-1">
            サーバーに接続中です...
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginButton; 