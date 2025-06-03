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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">見積データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← ダッシュボード
              </button>
              <h1 className="text-2xl font-bold text-gray-900">見積一覧</h1>
            </div>
            <button
              onClick={() => navigate('/estimates/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + 新規見積作成
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ステータスフィルタ */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusFilter('')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                statusFilter === '' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => handleStatusFilter('DRAFT')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                statusFilter === 'DRAFT' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              下書き
            </button>
            <button
              onClick={() => handleStatusFilter('SENT')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                statusFilter === 'SENT' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              送付済み
            </button>
            <button
              onClick={() => handleStatusFilter('APPROVED')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                statusFilter === 'APPROVED' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              承認済み
            </button>
            <button
              onClick={() => handleStatusFilter('REJECTED')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                statusFilter === 'REJECTED' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              否認
            </button>
          </div>
        </div>

        {/* 見積一覧 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">
              見積一覧 ({estimates.length}件)
              {statusFilter && ` - ${statusFilter}`}
            </h2>
          </div>
          
          {estimates.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {statusFilter ? `${statusFilter}の見積が見つかりません` : 'まだ見積が作成されていません。'}
              <div className="mt-4">
                <button
                  onClick={() => navigate('/estimates/new')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  最初の見積を作成する
                </button>
              </div>
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