import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from '../components/UserProfile';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                造園見積システム
              </h1>
              <p className="text-slate-600 mt-2 font-medium">Landscaping Estimate Management System</p>
            </div>
            <UserProfile />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ウェルカムセクション */}
        <div className="mb-10 bg-gradient-to-r from-white to-blue-50/50 rounded-2xl shadow-xl p-8 border border-white/50 backdrop-blur-sm">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl">🌿</span>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-slate-800 mb-3">
                こんにちは、{user?.name}さん
              </h2>
              <p className="text-slate-600 text-xl">造園工事の見積から請求まで一元管理できます</p>
            </div>
          </div>
        </div>

        {/* メニューカード */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* 見積作成 - インディゴブルー */}
          <div
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-2xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl group"
            onClick={() => handleMenuClick('/estimates/new')}
          >
            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
              📝
            </div>
            <h3 className="text-2xl font-bold mb-3">見積作成</h3>
            <p className="text-white/90 leading-relaxed">新しい見積を作成します</p>
          </div>

          {/* 見積一覧 - エメラルドグリーン */}
          <div
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl group"
            onClick={() => handleMenuClick('/estimates')}
          >
            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
              📋
            </div>
            <h3 className="text-2xl font-bold mb-3">見積一覧</h3>
            <p className="text-white/90 leading-relaxed">作成済みの見積を確認・編集します</p>
          </div>

          {/* 顧客管理 - パープル */}
          <div
            className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl group"
            onClick={() => handleMenuClick('/clients')}
          >
            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
              👥
            </div>
            <h3 className="text-2xl font-bold mb-3">顧客管理</h3>
            <p className="text-white/90 leading-relaxed">顧客情報を管理します</p>
          </div>

          {/* 単価マスタ - アンバーオレンジ */}
          <div
            className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl group"
            onClick={() => handleMenuClick('/items')}
          >
            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
              💰
            </div>
            <h3 className="text-2xl font-bold mb-3">単価マスタ</h3>
            <p className="text-white/90 leading-relaxed">工事項目の単価を管理します</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
          {/* 最近の活動 */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">最近の活動</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border-l-4 border-emerald-500 shadow-sm">
                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
                <div className="flex-1">
                  <span className="text-slate-800 font-semibold text-lg">システムが正常に起動しました</span>
                  <div className="text-slate-600 mt-1">データベース接続確認済み</div>
                </div>
                <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm font-medium">今</span>
              </div>
              <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border-l-4 border-blue-500 shadow-sm">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-sm"></div>
                <div className="flex-1">
                  <span className="text-slate-800 font-semibold text-lg">サンプルデータが読み込まれました</span>
                  <div className="text-slate-600 mt-1">顧客・単価マスタデータ準備完了</div>
                </div>
                <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm font-medium">今</span>
              </div>
            </div>
          </div>

          {/* クイックアクション */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">クイックアクション</h3>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/estimates/new')}
                className="w-full text-left p-6 bg-gradient-to-r from-indigo-50 to-indigo-100/50 hover:from-indigo-100 hover:to-indigo-200/50 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md border border-indigo-100"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 group-hover:text-indigo-700 text-lg">新規見積作成</div>
                    <div className="text-slate-600 mt-1">新しい見積を作成</div>
                  </div>
                  <svg className="w-5 h-5 text-indigo-500 group-hover:translate-x-1 transition-transform duration-200 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              <button
                onClick={() => navigate('/clients')}
                className="w-full text-left p-6 bg-gradient-to-r from-emerald-50 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-200/50 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md border border-emerald-100"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 group-hover:text-emerald-700 text-lg">顧客追加</div>
                    <div className="text-slate-600 mt-1">新規顧客を登録</div>
                  </div>
                  <svg className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform duration-200 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-100 group">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-600 mb-2">総見積数</h4>
                <p className="text-4xl font-bold text-slate-800 mb-1">0</p>
                <p className="text-slate-500">今月: 0件</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-100 group">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-600 mb-2">登録顧客数</h4>
                <p className="text-4xl font-bold text-slate-800 mb-1">0</p>
                <p className="text-slate-500">アクティブ: 0件</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-100 group">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-600 mb-2">単価マスタ</h4>
                <p className="text-4xl font-bold text-slate-800 mb-1">5</p>
                <p className="text-slate-500">カテゴリ: 2種類</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 