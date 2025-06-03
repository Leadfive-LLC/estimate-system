import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginButton: React.FC = () => {
  const { testLogin } = useAuth();

  const handleTestLogin = async () => {
    try {
      await testLogin('test@example.com', 'テストユーザー');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleTestLogin}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        テストログイン
      </button>
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