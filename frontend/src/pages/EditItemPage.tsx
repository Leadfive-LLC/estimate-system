import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../config/api';

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

const EditItemPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    specification: '',
    unit: '',
    purchasePrice: '',
    markupRate: '',
    unitPrice: '',
    description: '',
    isActive: true
  });

  const categories = ['植栽工事', 'ガレージ工事', 'テラス工事', '電気工事', 'ウッドフェンス建柱'];

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await apiRequest(`/api/items/${id}`);

      if (response.ok) {
        const itemData = await response.json();
        setItem(itemData);
        setFormData({
          name: itemData.name || '',
          category: itemData.category || '',
          specification: itemData.specification || '',
          unit: itemData.unit || '',
          purchasePrice: itemData.purchasePrice?.toString() || '',
          markupRate: itemData.markupRate?.toString() || '',
          unitPrice: itemData.unitPrice?.toString() || '',
          description: itemData.description || '',
          isActive: itemData.isActive
        });
      } else {
        console.error('Failed to fetch item');
        navigate('/items');
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      navigate('/items');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const calculatePrice = () => {
    const purchasePrice = parseFloat(formData.purchasePrice) || 0;
    const markupRate = parseFloat(formData.markupRate) || 1.5;
    return Math.round(purchasePrice * markupRate);
  };

  const handleAutoCalculate = () => {
    const calculatedPrice = calculatePrice();
    setFormData(prev => ({
      ...prev,
      unitPrice: calculatedPrice.toString()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await apiRequest(`/api/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          specification: formData.specification,
          unit: formData.unit,
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
          markupRate: formData.markupRate ? parseFloat(formData.markupRate) : 1.5,
          unitPrice: parseFloat(formData.unitPrice),
          description: formData.description,
          isActive: formData.isActive
        })
      });

      if (response.ok) {
        navigate('/items');
      } else {
        console.error('Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">項目データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/items')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← 単価マスタ一覧
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">項目編集</h1>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">項目情報</h2>
            <p className="mt-1 text-sm text-gray-600">項目の詳細情報を編集してください。</p>
          </div>

          <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-6 space-y-6">
            {/* 基本情報 */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  項目名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリー <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                >
                  <option value="">選択してください</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  仕様
                </label>
                <input
                  type="text"
                  name="specification"
                  value={formData.specification}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="サイズ、材質、規格など"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  単位
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="株、㎡、式、本など"
                />
              </div>
            </div>

            {/* 価格設定 */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">価格設定</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    仕入単価（円）
                  </label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    step="0.01"
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    掛け率 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="markupRate"
                    value={formData.markupRate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    step="0.01"
                    min="0.01"
                    placeholder="1.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    見積単価（円） <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      name="unitPrice"
                      value={formData.unitPrice}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                      step="0.01"
                      min="0"
                      placeholder="0"
                    />
                    <button
                      type="button"
                      onClick={handleAutoCalculate}
                      className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors"
                      title="仕入単価×掛け率で自動計算"
                    >
                      📱 自動計算 (仕入単価 × 掛け率)
                    </button>
                  </div>
                </div>
              </div>

              {/* 価格計算ヒント */}
              {formData.purchasePrice && formData.markupRate && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start text-sm text-blue-700">
                    <svg className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <div className="font-medium mb-1">計算結果</div>
                      <div>¥{parseFloat(formData.purchasePrice).toLocaleString()} × {formData.markupRate} = ¥{calculatePrice().toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 説明・備考 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                説明・備考
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                placeholder="項目の詳細説明や備考を入力"
              />
            </div>

            {/* ステータス */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleCheckboxChange}
                  className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">この項目を有効にする</span>
                  <p className="mt-1 text-xs text-gray-500">
                    無効にした項目は見積作成時に表示されません
                  </p>
                </div>
              </label>
            </div>

            {/* 操作ボタン */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/items')}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-base"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 text-base font-medium"
              >
                {saving ? '💾 保存中...' : '💾 保存'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditItemPage; 