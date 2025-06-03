import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from '../components/UserProfile';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      title: '見積作成',
      description: '新しい見積を作成します',
      icon: '📝',
      path: '/estimates/new',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: '見積一覧',
      description: '作成済みの見積を確認・編集します',
      icon: '📋',
      path: '/estimates',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: '顧客管理',
      description: '顧客情報を管理します',
      icon: '👥',
      path: '/clients',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: '単価マスタ',
      description: '工事項目の単価を管理します',
      icon: '💰',
      path: '/items',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">造園見積システム</h1>
            <UserProfile />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">ダッシュボード</h2>
          <p className="text-gray-600">造園工事の見積から請求まで一元管理</p>
        </div>

        {/* メニューカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`${item.color} text-white rounded-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg`}
              onClick={() => handleMenuClick(item.path)}
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm opacity-90">{item.description}</p>
            </div>
          ))}
        </div>

        {/* 最近の活動 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の活動</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">システムが正常に起動しました</span>
              <span className="text-sm text-gray-500 ml-auto">今</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">サンプルデータが読み込まれました</span>
              <span className="text-sm text-gray-500 ml-auto">今</span>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">総見積数</h4>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600 mt-1">今月: 0件</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">登録顧客数</h4>
            <p className="text-3xl font-bold text-gray-900">2</p>
            <p className="text-sm text-gray-600 mt-1">アクティブ: 2件</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">単価マスタ</h4>
            <p className="text-3xl font-bold text-gray-900">10</p>
            <p className="text-sm text-gray-600 mt-1">カテゴリ: 5種類</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 