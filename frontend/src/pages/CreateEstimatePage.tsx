import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Item {
  id: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  description?: string;
}

interface EstimateItem {
  id: string;
  itemId: string;
  item: Item;
  quantity: number;
  unitPrice: number;
  amount: number;
  notes?: string;
}

const CreateEstimatePage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // フォームデータ
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    description: '',
    validUntil: '',
    notes: ''
  });
  
  // 見積項目
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // 顧客データと単価マスタを並行して取得
      const [clientsResponse, itemsResponse, categoriesResponse] = await Promise.all([
        fetch('http://localhost:3001/api/clients', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/items', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/items/categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        setClients(clientsData);
      }

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setItems(itemsData);
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addEstimateItem = (item: Item) => {
    const newEstimateItem: EstimateItem = {
      id: Date.now().toString(),
      itemId: item.id,
      item: item,
      quantity: 1,
      unitPrice: item.unitPrice,
      amount: item.unitPrice,
      notes: ''
    };
    
    setEstimateItems([...estimateItems, newEstimateItem]);
    setShowItemSelector(false);
  };

  const updateEstimateItem = (id: string, field: string, value: number | string) => {
    setEstimateItems(estimateItems.map(estimateItem => {
      if (estimateItem.id === id) {
        const updatedItem = { ...estimateItem, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return estimateItem;
    }));
  };

  const removeEstimateItem = (id: string) => {
    setEstimateItems(estimateItems.filter(item => item.id !== id));
  };

  const getTotalAmount = () => {
    return estimateItems.reduce((total, item) => total + item.amount, 0);
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = async (status: 'DRAFT' | 'SENT') => {
    if (!formData.title.trim() || !formData.clientId || estimateItems.length === 0) {
      alert('見積タイトル、顧客、見積項目は必須です。');
      return;
    }

    setSaving(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const estimateData = {
        title: formData.title,
        clientId: formData.clientId,
        description: formData.description,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        notes: formData.notes,
        status,
        totalAmount: getTotalAmount(),
        items: estimateItems.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          notes: item.notes
        }))
      };

      const response = await fetch('http://localhost:3001/api/estimates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(estimateData)
      });

      if (response.ok) {
        const newEstimate = await response.json();
        navigate(`/estimates/${newEstimate.id}`);
      } else {
        console.error('Failed to create estimate');
        alert('見積の保存に失敗しました。');
      }
    } catch (error) {
      console.error('Error creating estimate:', error);
      alert('見積の保存中にエラーが発生しました。');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
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
                onClick={() => navigate('/estimates')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← 見積一覧
              </button>
              <h1 className="text-2xl font-bold text-gray-900">新規見積作成</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleSubmit('DRAFT')}
                disabled={saving}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                下書き保存
              </button>
              <button
                onClick={() => handleSubmit('SENT')}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                見積として保存
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側: 基本情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">基本情報</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    見積タイトル <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 田中様邸庭園改修工事見積"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    顧客 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">顧客を選択してください</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.email && `(${client.email})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    有効期限
                  </label>
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    工事概要
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="工事の概要を記述してください"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    備考
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="その他特記事項があれば記述してください"
                  />
                </div>
              </div>
            </div>

            {/* 見積項目 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">見積項目</h2>
                <button
                  onClick={() => setShowItemSelector(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  + 項目追加
                </button>
              </div>

              {estimateItems.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  まだ項目が追加されていません。
                  <br />
                  「項目追加」ボタンから工事項目を追加してください。
                </div>
              ) : (
                <div className="space-y-4">
                  {estimateItems.map((estimateItem, index) => (
                    <div key={estimateItem.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{estimateItem.item.name}</h4>
                          <p className="text-sm text-gray-500">{estimateItem.item.category}</p>
                          {estimateItem.item.description && (
                            <p className="text-sm text-gray-600 mt-1">{estimateItem.item.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeEstimateItem(estimateItem.id)}
                          className="text-red-600 hover:text-red-800 ml-4"
                        >
                          削除
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 mt-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">数量</label>
                          <input
                            type="number"
                            value={estimateItem.quantity}
                            onChange={(e) => updateEstimateItem(estimateItem.id, 'quantity', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">単位</label>
                          <input
                            type="text"
                            value={estimateItem.item.unit}
                            readOnly
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">単価</label>
                          <input
                            type="number"
                            value={estimateItem.unitPrice}
                            onChange={(e) => updateEstimateItem(estimateItem.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            min="0"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">金額</label>
                          <input
                            type="text"
                            value={`¥${estimateItem.amount.toLocaleString()}`}
                            readOnly
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50 font-medium"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-xs text-gray-500 mb-1">備考</label>
                        <input
                          type="text"
                          value={estimateItem.notes || ''}
                          onChange={(e) => updateEstimateItem(estimateItem.id, 'notes', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="項目の備考があれば記入"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右側: 合計金額 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">見積金額</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">項目数</span>
                  <span className="font-medium">{estimateItems.length}項目</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>合計金額</span>
                  <span className="text-blue-600">¥{getTotalAmount().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 項目選択モーダル */}
        {showItemSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto m-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">項目を選択</h3>
                <button
                  onClick={() => setShowItemSelector(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* 検索・フィルタ */}
              <div className="flex space-x-4 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="項目名で検索..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">すべてのカテゴリ</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* 項目一覧 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredItems.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => addEstimateItem(item)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm ml-4"
                      >
                        追加
                      </button>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">¥{item.unitPrice.toLocaleString()} / {item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  条件に一致する項目が見つかりません。
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateEstimatePage; 