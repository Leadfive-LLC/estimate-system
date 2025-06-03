import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Item {
  id: string;
  name: string;
  category: string;
  specification?: string;
  unit?: string;
  purchasePrice?: number;
  markupRate: number;
  unitPrice: number;
  description?: string;
  isActive: boolean;
}

interface EditingItem {
  id: string;
  field: string;
  value: string;
}

const ItemsPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  useEffect(() => {
    fetchItems();
    // スマホかどうかを判定してデフォルトビューを設定
    const isMobile = window.innerWidth < 768;
    setViewMode(isMobile ? 'cards' : 'table');
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/items', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        console.error('Failed to fetch items');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId: string, field: string, value: string) => {
    setSaving(itemId);
    try {
      const token = localStorage.getItem('authToken');
      const updateData: any = {};
      
      if (field === 'purchasePrice') {
        updateData.purchasePrice = value ? parseFloat(value) : null;
      } else if (field === 'markupRate') {
        updateData.markupRate = parseFloat(value);
      } else if (field === 'unitPrice') {
        updateData.unitPrice = parseFloat(value);
      }

      const response = await fetch(`http://localhost:3001/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setItems(items.map(item => item.id === itemId ? updatedItem : item));
        setEditingItem(null);
      } else {
        console.error('Failed to update item');
        alert('更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('更新中にエラーが発生しました');
    } finally {
      setSaving(null);
    }
  };

  const handleCellClick = (itemId: string, field: string, currentValue: any) => {
    setEditingItem({
      id: itemId,
      field: field,
      value: currentValue?.toString() || ''
    });
  };

  const handleInputChange = (value: string) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, value });
    }
  };

  const handleInputBlur = () => {
    if (editingItem) {
      updateItem(editingItem.id, editingItem.field, editingItem.value);
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setEditingItem(null);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.specification && item.specification.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesActive = !showActiveOnly || item.isActive;
    
    return matchesSearch && matchesCategory && matchesActive;
  });

  const categories = Array.from(new Set(items.map(item => item.category)));

  const formatPrice = (price?: number | null) => {
    if (price === null || price === undefined) return '-';
    return `¥${price.toLocaleString()}`;
  };

  const calculateActualPrice = (purchasePrice?: number | null, markupRate?: number, unitPrice?: number) => {
    if (purchasePrice && markupRate && purchasePrice > 0) {
      return Math.round(purchasePrice * markupRate);
    }
    return unitPrice || 0;
  };

  const renderEditableCell = (item: Item, field: string, value: any, formatter?: (val: any) => string) => {
    const isEditing = editingItem?.id === item.id && editingItem?.field === field;
    const isSaving = saving === item.id;
    
    if (isEditing) {
      return (
        <input
          type="number"
          value={editingItem.value}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyPress}
          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          autoFocus
          step="0.01"
        />
      );
    }

    return (
      <div
        onClick={() => handleCellClick(item.id, field, value)}
        className={`cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors min-h-[2rem] flex items-center ${
          isSaving ? 'opacity-50' : ''
        }`}
        title="タップして編集"
      >
        {isSaving ? '保存中...' : (formatter ? formatter(value) : value)}
      </div>
    );
  };

  const renderItemCard = (item: Item) => {
    const calculatedPrice = calculateActualPrice(item.purchasePrice, item.markupRate, item.unitPrice);
    const hasPriceDiscrepancy = item.purchasePrice && Math.abs(calculatedPrice - item.unitPrice) > 1;
    
    return (
      <div key={item.id} className={`bg-white rounded-lg shadow-sm border p-4 ${!item.isActive ? 'opacity-50' : ''}`}>
        {/* ヘッダー部分 */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
            <div className="flex items-center mt-1 space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {item.category}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                item.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {item.isActive ? '有効' : '無効'}
              </span>
            </div>
          </div>
        </div>

        {/* 仕様・単位 */}
        {(item.specification || item.unit) && (
          <div className="mb-3 text-sm text-gray-600">
            {item.specification && <div>仕様: {item.specification}</div>}
            {item.unit && <div>単位: {item.unit}</div>}
          </div>
        )}

        {/* 価格情報 */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">仕入単価:</span>
            <div className="text-right">
              {renderEditableCell(item, 'purchasePrice', item.purchasePrice, formatPrice)}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">掛け率:</span>
            <div className="text-right">
              {renderEditableCell(item, 'markupRate', item.markupRate, (val) => `${val}x`)}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">見積単価:</span>
            <div className="text-right">
              <div className={hasPriceDiscrepancy ? 'text-red-600 font-medium' : ''}>
                {renderEditableCell(item, 'unitPrice', item.unitPrice, formatPrice)}
              </div>
              {hasPriceDiscrepancy && (
                <div className="text-xs text-gray-500 mt-1">
                  計算値: {formatPrice(calculatedPrice)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 説明 */}
        {item.description && (
          <div className="mb-3 text-xs text-gray-500 border-t pt-2">
            {item.description}
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex space-x-2 pt-3 border-t">
          <button
            onClick={() => navigate(`/items/${item.id}/edit`)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
          >
            詳細編集
          </button>
          <button
            onClick={() => {/* 削除処理 */}}
            className="px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded text-sm transition-colors"
          >
            削除
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">単価マスタを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← ダッシュボード
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">単価マスタ管理</h1>
            </div>
            <div className="flex items-center space-x-2">
              {/* ビュー切り替え */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📋 表形式
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'cards' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📱 カード形式
                </button>
              </div>
              <button
                onClick={() => navigate('/items/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                + 新規追加
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* フィルタ・検索エリア */}
        <div className="bg-white rounded-lg shadow mb-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                検索
              </label>
              <input
                type="text"
                placeholder="項目名、カテゴリー、仕様で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリー
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">すべて</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                表示
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">有効項目のみ</span>
              </label>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                表示中: {filteredItems.length}件 / 全{items.length}件
              </div>
            </div>
          </div>
        </div>

        {/* 編集のヒント */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>💡 編集方法:</strong> 価格欄をタップすると直接編集できます。Enterで保存、Escapeでキャンセルです。
              </p>
            </div>
          </div>
        </div>

        {/* カテゴリ別サマリー */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-6">
          {categories.map(category => {
            const categoryItems = items.filter(item => item.category === category && item.isActive);
            const totalValue = categoryItems.reduce((sum, item) => sum + Number(item.unitPrice), 0);
            return (
              <div key={category} className="bg-white rounded-lg shadow p-3 sm:p-4">
                <h3 className="font-medium text-gray-900 text-xs sm:text-sm mb-2 truncate" title={category}>
                  {category}
                </h3>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{categoryItems.length}</p>
                <p className="text-xs text-gray-500">項目</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                  参考総額: {formatPrice(totalValue)}
                </p>
              </div>
            );
          })}
        </div>

        {/* メインコンテンツ表示 */}
        {viewMode === 'cards' ? (
          /* カード表示 */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(renderItemCard)}
          </div>
        ) : (
          /* テーブル表示 */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      カテゴリー
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      詳細（各項目）
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      仕様
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      仕入単価 <span className="text-blue-500">📝</span>
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      掛け率 <span className="text-blue-500">📝</span>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      見積単価 <span className="text-blue-500">📝</span>
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => {
                    const calculatedPrice = calculateActualPrice(item.purchasePrice, item.markupRate, item.unitPrice);
                    const hasPriceDiscrepancy = item.purchasePrice && Math.abs(calculatedPrice - item.unitPrice) > 1;
                    
                    return (
                      <tr key={item.id} className={!item.isActive ? 'opacity-50' : ''}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500 mt-1 hidden sm:block">{item.description}</div>
                          )}
                          {/* スマホ時に仕様と掛け率を表示 */}
                          <div className="sm:hidden mt-1 space-y-1">
                            {item.specification && (
                              <div className="text-xs text-gray-500">仕様: {item.specification}</div>
                            )}
                            <div className="text-xs text-gray-500">
                              掛け率: {renderEditableCell(item, 'markupRate', item.markupRate, (val) => `${val}x`)}
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.specification || '-'}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {renderEditableCell(item, 'purchasePrice', item.purchasePrice, formatPrice)}
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {renderEditableCell(item, 'markupRate', item.markupRate, (val) => `${val}x`)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          <div className={hasPriceDiscrepancy ? 'text-red-600 font-medium' : ''}>
                            {renderEditableCell(item, 'unitPrice', item.unitPrice, formatPrice)}
                          </div>
                          {hasPriceDiscrepancy && (
                            <div className="text-xs text-gray-500 mt-1">
                              計算値: {formatPrice(calculatedPrice)}
                            </div>
                          )}
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            onClick={() => navigate(`/items/${item.id}/edit`)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="詳細編集"
                          >
                            詳細編集
                          </button>
                          <button
                            onClick={() => {/* 削除処理 */}}
                            className="text-red-600 hover:text-red-900"
                            title="削除"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">条件に一致する項目が見つかりませんでした</div>
          </div>
        )}

        {/* 集計情報 */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">全体統計</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">総項目数:</span>
                <span className="font-medium">{items.length}件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">有効項目:</span>
                <span className="font-medium">{items.filter(i => i.isActive).length}件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">カテゴリー数:</span>
                <span className="font-medium">{categories.length}種類</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">価格統計</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">平均単価:</span>
                <span className="font-medium">
                  {formatPrice(
                    Math.round(
                      filteredItems.reduce((sum, item) => sum + Number(item.unitPrice), 0) / 
                      Math.max(filteredItems.length, 1)
                    )
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">最高単価:</span>
                <span className="font-medium">
                  {formatPrice(Math.max(...filteredItems.map(item => Number(item.unitPrice))))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">最低単価:</span>
                <span className="font-medium">
                  {formatPrice(Math.min(...filteredItems.map(item => Number(item.unitPrice))))}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">掛け率統計</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">平均掛け率:</span>
                <span className="font-medium">
                  {(filteredItems.reduce((sum, item) => sum + Number(item.markupRate), 0) / 
                    Math.max(filteredItems.length, 1)).toFixed(2)}x
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">標準掛け率:</span>
                <span className="font-medium">1.5x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">価格調整項目:</span>
                <span className="font-medium">
                  {filteredItems.filter(item => {
                    const calc = calculateActualPrice(item.purchasePrice, item.markupRate, item.unitPrice);
                    return item.purchasePrice && Math.abs(calc - item.unitPrice) > 1;
                  }).length}件
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ItemsPage;