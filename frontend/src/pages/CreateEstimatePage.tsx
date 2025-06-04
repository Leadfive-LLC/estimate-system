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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  新規見積作成
                </h1>
                <p className="text-slate-600 mt-1 font-medium">造園工事の見積書を作成します</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleSubmit('DRAFT')}
                disabled={saving}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg transition-colors font-medium shadow-lg disabled:opacity-50 flex items-center space-x-2"
                style={{background: 'linear-gradient(to right, #22c55e, #059669)', border: 'none'}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>{saving ? '保存中...' : '下書き保存'}</span>
              </button>
              <button
                onClick={() => handleSubmit('SENT')}
                disabled={saving}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg transition-colors font-medium shadow-lg disabled:opacity-50 flex items-center space-x-2"
                style={{background: 'linear-gradient(to right, #3b82f6, #4f46e5)', border: 'none'}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>{saving ? '送信中...' : '見積送信'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側: 基本情報と見積項目 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 基本情報 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">基本情報</h2>
                  <p className="text-slate-600 mt-1">見積の基本情報を入力してください</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    見積タイトル <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                    placeholder="例: 田中様邸庭園改修工事見積"
                  />
                  <p className="text-xs text-slate-500 mt-2">顧客に表示される見積のタイトルです</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    顧客 <span className="text-red-500">*</span>
                  </label>
                  {clients.length === 0 ? (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-amber-800">顧客が登録されていません</h3>
                          <p className="text-sm text-amber-700 mt-1">見積を作成するには、まず顧客を登録する必要があります。</p>
                          <button
                            onClick={() => navigate('/clients')}
                            className="mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg"
                          >
                            顧客管理画面へ移動
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <select
                      name="clientId"
                      value={formData.clientId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                    >
                      <option value="">顧客を選択してください</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name} {client.address && `(${client.address})`}
                        </option>
                      ))}
                    </select>
                  )}
                  {clients.length > 0 && (
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-slate-500">登録済み顧客: {clients.length}件</p>
                      <button
                        onClick={() => navigate('/clients')}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        新しい顧客を追加 →
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    有効期限
                  </label>
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">見積の有効期限を設定します（任意）</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    工事概要
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                    placeholder="工事の概要を記述してください（例: 庭園リフォーム、植栽工事、石積み工事など）"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    備考
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                    placeholder="その他特記事項があれば記述してください"
                  />
                </div>
              </div>
            </div>

            {/* 見積項目 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">見積項目</h2>
                    <p className="text-slate-600 mt-1">工事の詳細項目と単価を設定します</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowItemSelector(true)}
                  className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white px-6 py-3 rounded-xl transition-colors font-medium shadow-lg flex items-center space-x-2"
                  style={{background: 'linear-gradient(to right, #a855f7, #7c3aed)', border: 'none'}}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>項目追加</span>
                </button>
              </div>

              {estimateItems.length === 0 ? (
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">見積項目を追加してください</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    工事項目（植栽工事、土木工事、電気工事など）を単価マスタから選択して追加します。
                    <br />
                    数量と単価を設定して見積金額を計算します。
                  </p>
                  <button
                    onClick={() => setShowItemSelector(true)}
                    className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white px-8 py-4 rounded-xl transition-colors font-medium inline-flex items-center space-x-2 shadow-lg"
                    style={{background: 'linear-gradient(to right, #a855f7, #7c3aed)', border: 'none'}}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>最初の項目を追加</span>
                  </button>
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-700">
                      <strong>ヒント:</strong> 単価マスタに項目がない場合は、
                      <button
                        onClick={() => navigate('/items')}
                        className="text-blue-600 hover:text-blue-800 underline font-medium ml-1"
                      >
                        単価マスタ管理
                      </button>
                      で新しい項目を登録してください。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {estimateItems.map((estimateItem, index) => (
                    <div key={estimateItem.id} className="border border-slate-200 rounded-xl p-6 bg-gradient-to-r from-white to-slate-50 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800 text-lg">{estimateItem.item.name}</h4>
                          <p className="text-sm text-slate-500 mt-1">{estimateItem.item.category}</p>
                          {estimateItem.item.description && (
                            <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg p-2">{estimateItem.item.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeEstimateItem(estimateItem.id)}
                          className="text-red-500 hover:text-red-700 ml-4 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">数量</label>
                          <input
                            type="number"
                            value={estimateItem.quantity}
                            onChange={(e) => updateEstimateItem(estimateItem.id, 'quantity', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.1"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">単位</label>
                          <input
                            type="text"
                            value={estimateItem.item.unit}
                            readOnly
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">単価</label>
                          <input
                            type="number"
                            value={estimateItem.unitPrice}
                            onChange={(e) => updateEstimateItem(estimateItem.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            min="0"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">金額</label>
                          <input
                            type="text"
                            value={`¥${estimateItem.amount.toLocaleString()}`}
                            readOnly
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-emerald-50 text-emerald-700 font-semibold"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-xs font-medium text-slate-600 mb-2">備考</label>
                        <input
                          type="text"
                          value={estimateItem.notes || ''}
                          onChange={(e) => updateEstimateItem(estimateItem.id, 'notes', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
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
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-24 border border-gray-100">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">見積金額</h2>
                  <p className="text-slate-600 mt-1">自動計算されます</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-600 font-semibold">見積項目数</span>
                    <span className="text-xl font-bold text-slate-800">{estimateItems.length}項目</span>
                  </div>
                  
                  {estimateItems.length > 0 && (
                    <div className="space-y-3 mt-4 pt-4 border-t border-slate-200">
                      {estimateItems.map((item, index) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-slate-600 truncate flex-1">{item.item.name}</span>
                          <span className="font-semibold ml-3 text-slate-800">¥{item.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 border-2 border-emerald-200">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-800 font-bold text-xl">合計金額</span>
                    <span className="text-3xl font-bold text-emerald-600">¥{getTotalAmount().toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-emerald-700 mt-2">消費税込みの金額</p>
                </div>
                
                {getTotalAmount() > 0 && (
                  <div className="space-y-3 text-sm bg-slate-50 rounded-xl p-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">小計（税抜き）</span>
                      <span className="font-medium text-slate-800">¥{Math.round(getTotalAmount() / 1.1).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">消費税（10%）</span>
                      <span className="font-medium text-slate-800">¥{(getTotalAmount() - Math.round(getTotalAmount() / 1.1)).toLocaleString()}</span>
                    </div>
                  </div>
                )}
                
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">💡 ヒント</p>
                    <ul className="text-left space-y-2 text-xs text-slate-600">
                      <li className="flex items-start space-x-2">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span>項目をクリックして詳細を編集</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span>数量や単価は個別に調整可能</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span>下書き保存で作業を中断可能</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 項目選択モーダル */}
        {showItemSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden">
              {/* モーダルヘッダー */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold">工事項目を選択</h3>
                    <p className="text-emerald-100 mt-1">単価マスタから見積に追加する項目を選択してください</p>
                  </div>
                  <button
                    onClick={() => setShowItemSelector(false)}
                    className="w-10 h-10 bg-white/30 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors border border-white/20"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 検索・フィルタエリア */}
              <div className="p-6 bg-slate-50 border-b">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">項目名で検索</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="例: 植栽、土工、電気..."
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                      />
                      <svg className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">カテゴリで絞り込み</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">すべてのカテゴリ</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    {filteredItems.length}件の項目が見つかりました
                  </p>
                  <button
                    onClick={() => navigate('/items')}
                    className="text-sm text-emerald-600 hover:text-emerald-800 font-medium flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>新しい項目を追加</span>
                  </button>
                </div>
              </div>

              {/* 項目一覧 */}
              <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(85vh - 280px)'}}>
                {filteredItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">条件に一致する項目が見つかりません</h3>
                    <p className="text-slate-600 mb-4">
                      検索条件を変更するか、新しい項目を追加してください。
                    </p>
                    <button
                      onClick={() => navigate('/items')}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                      単価マスタ管理へ移動
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredItems.map(item => (
                      <div key={item.id} className="bg-gradient-to-r from-white to-blue-50/30 border border-slate-200 rounded-lg p-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue-100/50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-slate-800">{item.name}</h4>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {item.category}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-emerald-600">
                                ¥{item.unitPrice.toLocaleString()}
                              </span>
                              <span className="text-sm text-slate-500">
                                / {item.unit}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => addEstimateItem(item)}
                            className="ml-4 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md flex items-center space-x-1"
                            style={{background: 'linear-gradient(to right, #14b8a6, #0891b2)', border: 'none'}}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>追加</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* モーダルフッター */}
              <div className="p-6 bg-gray-50 border-t">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-600">
                    項目を選択後、数量と単価を調整できます
                  </p>
                  <button
                    onClick={() => setShowItemSelector(false)}
                    className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white px-6 py-3 rounded-lg transition-colors font-medium shadow-lg"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateEstimatePage; 