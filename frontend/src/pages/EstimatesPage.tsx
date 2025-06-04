import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Estimate {
  id: string;
  title: string;
  status: string;
  totalAmount: number;
  validUntil?: string;
  createdAt: string;
  client: {
    id: string;
    name: string;
    email?: string;
  };
  user: {
    id: string;
    name: string;
  };
  _count: {
    items: number;
  };
}

const EstimatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchEstimates();
  }, [statusFilter]);

  const fetchEstimates = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const url = statusFilter 
        ? `http://localhost:3001/api/estimates?status=${statusFilter}`
        : 'http://localhost:3001/api/estimates';
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEstimates(data);
      } else {
        console.error('Failed to fetch estimates');
      }
    } catch (error) {
      console.error('Error fetching estimates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { color: 'bg-gray-100 text-gray-800', label: '下書き' },
      'SENT': { color: 'bg-blue-100 text-blue-800', label: '送付済み' },
      'APPROVED': { color: 'bg-green-100 text-green-800', label: '承認済み' },
      'REJECTED': { color: 'bg-red-100 text-red-800', label: '否認' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setLoading(true);
  };

  const handleEstimateClick = (estimateId: string) => {
    navigate(`/estimates/${estimateId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">見積データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                ダッシュボード
              </button>
              <div className="h-6 w-px bg-slate-300"></div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">見積一覧</h1>
                <p className="text-slate-600 mt-1 font-medium">作成済みの見積を管理します</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/estimates/new')}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg transition-colors font-medium shadow-lg"
            >
              + 新規見積作成
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ステータスフィルタ */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">ステータス フィルター</h2>
              <p className="text-slate-600 text-sm">見積の状態で絞り込み表示</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleStatusFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                statusFilter === '' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => handleStatusFilter('DRAFT')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                statusFilter === 'DRAFT' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              下書き
            </button>
            <button
              onClick={() => handleStatusFilter('SENT')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                statusFilter === 'SENT' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              送付済み
            </button>
            <button
              onClick={() => handleStatusFilter('APPROVED')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                statusFilter === 'APPROVED' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              承認済み
            </button>
            <button
              onClick={() => handleStatusFilter('REJECTED')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                statusFilter === 'REJECTED' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              否認
            </button>
          </div>
        </div>

        {/* 見積一覧 */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">
              見積一覧 ({estimates.length}件)
              {statusFilter && ` - ${statusFilter}`}
            </h2>
          </div>
          
          {estimates.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {statusFilter ? `${statusFilter}の見積が見つかりません` : 'まだ見積が作成されていません'}
              </h3>
              <p className="text-slate-600 mb-6">最初の見積を作成して始めましょう。</p>
              <button
                onClick={() => navigate('/estimates/new')}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg transition-colors font-medium inline-flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>最初の見積を作成する</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      見積タイトル
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      顧客
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      金額
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      項目数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作成日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estimates.map((estimate) => (
                    <tr 
                      key={estimate.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleEstimateClick(estimate.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{estimate.title}</div>
                        {estimate.validUntil && (
                          <div className="text-sm text-gray-500">
                            有効期限: {new Date(estimate.validUntil).toLocaleDateString('ja-JP')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{estimate.client.name}</div>
                        {estimate.client.email && (
                          <div className="text-sm text-gray-500">{estimate.client.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(estimate.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{estimate.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {estimate._count.items}項目
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(estimate.createdAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/estimates/${estimate.id}/edit`);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          編集
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: 削除確認ダイアログ
                            console.log('Delete estimate:', estimate.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EstimatesPage; 