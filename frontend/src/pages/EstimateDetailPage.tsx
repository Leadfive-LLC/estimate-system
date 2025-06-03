import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface EstimateDetail {
  id: string;
  title: string;
  status: string;
  totalAmount: number;
  validUntil?: string;
  description?: string;
  notes?: string;
  createdAt: string;
  client: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    notes?: string;
    item: {
      id: string;
      name: string;
      category: string;
      unit: string;
      description?: string;
    };
  }>;
}

const EstimateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [estimate, setEstimate] = useState<EstimateDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEstimate(id);
    }
  }, [id]);

  const fetchEstimate = async (estimateId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/estimates/${estimateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEstimate(data);
      } else {
        console.error('Failed to fetch estimate');
        navigate('/estimates');
      }
    } catch (error) {
      console.error('Error fetching estimate:', error);
      navigate('/estimates');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      'DRAFT': '下書き',
      'SENT': '送付済み',
      'APPROVED': '承認済み',
      'REJECTED': '否認'
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `R${year - 2018}年${month}月${day}日`; // 令和年に変換
  };

  const calculateSubtotal = () => {
    if (!estimate) return 0;
    return estimate.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = (subtotal: number) => {
    return Math.floor(subtotal * 0.1);
  };

  const handlePrint = () => {
    window.print();
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

  if (!estimate) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">見積が見つかりません。</p>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー（印刷時は非表示） */}
      <header className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/estimates')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← 見積一覧
              </button>
              <h1 className="text-2xl font-bold text-gray-900">見積詳細</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handlePrint}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                印刷
              </button>
              <button
                onClick={() => navigate(`/estimates/${estimate.id}/edit`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                編集
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 見積書本体 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:py-0 print:px-0 print:max-w-none">
        <div className="bg-white shadow-lg print:shadow-none">
          {/* 見積書ヘッダー */}
          <div className="p-8 border-b">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">お見積ご提案書</h1>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>作成日: {formatDate(estimate.createdAt)}</p>
                  {estimate.validUntil && (
                    <p>お見積有効期限: 1ヶ月</p>
                  )}
                  <p>ステータス: {getStatusLabel(estimate.status)}</p>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="mb-4">
                  <p className="text-lg font-bold text-blue-600">創建工房 緑</p>
                  <p className="text-gray-600">庭想人株式会社</p>
                </div>
                <div className="space-y-1 text-gray-600">
                  <p>〒639-2153</p>
                  <p>奈良県葛城市太田262-1</p>
                  <p>tel/fax: 0745-48-3057</p>
                  <p>携帯: 090-8937-1314</p>
                </div>
              </div>
            </div>

            {/* 顧客情報 */}
            <div className="border border-gray-300 p-4 mb-6">
              <h2 className="text-lg font-semibold mb-2">{estimate.client.name} 様</h2>
              {estimate.client.address && (
                <p className="text-gray-600">{estimate.client.address}</p>
              )}
              {estimate.client.phone && (
                <p className="text-gray-600">TEL: {estimate.client.phone}</p>
              )}
              {estimate.client.email && (
                <p className="text-gray-600">Email: {estimate.client.email}</p>
              )}
            </div>

            {/* 挨拶文 */}
            <div className="border border-gray-300 p-4 mb-6 text-sm">
              <p>拝啓　時下ますますご清栄のこととお慶び申し上げます。</p>
              <p>平素は格別のご高配を賜り、厚く御礼申し上げます。</p>
              <p>下記内容のお見積りを申し上げます。</p>
              <p>ご検討の程よろしくお願い申し上げます。</p>
            </div>

            {/* 合計金額 */}
            <div className="bg-orange-100 p-4 rounded mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">合計金額</span>
                <div className="text-right">
                  <div className="text-2xl font-bold">¥{total.toLocaleString()}</div>
                  <div className="text-sm text-red-600">内消費税 (10%) ¥{tax.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* 作業内容 */}
            <div className="mb-6">
              <div className="border border-gray-300 p-3 bg-gray-50">
                <span className="font-semibold">作業内容</span>
                <span className="ml-4">{estimate.title}</span>
              </div>
            </div>
          </div>

          {/* 見積項目テーブル */}
          <div className="p-8">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left">内容</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">別紙添付</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">仕様</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">数量</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">単価 (円)</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">金額 (円)</th>
                </tr>
              </thead>
              <tbody>
                {estimate.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="font-medium">{item.item.name}</div>
                      {item.item.description && (
                        <div className="text-xs text-gray-600 mt-1">{item.item.description}</div>
                      )}
                      {item.notes && (
                        <div className="text-xs text-blue-600 mt-1">{item.notes}</div>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {item.item.category === 'ガレージ工事' || item.item.category === 'テラス工事' ? 'NO.3' : ''}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {item.item.unit}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      {item.unitPrice.toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      {item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                
                {/* 空行を追加 */}
                {Array.from({ length: Math.max(0, 7 - estimate.items.length) }).map((_, index) => (
                  <tr key={`empty-${index}`}>
                    <td className="border border-gray-300 px-3 py-2 h-8"></td>
                    <td className="border border-gray-300 px-3 py-2"></td>
                    <td className="border border-gray-300 px-3 py-2"></td>
                    <td className="border border-gray-300 px-3 py-2"></td>
                    <td className="border border-gray-300 px-3 py-2"></td>
                    <td className="border border-gray-300 px-3 py-2 text-right">0</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} className="border border-gray-300 px-3 py-2 text-center font-medium">設計費</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">200,000</td>
                </tr>
                <tr>
                  <td colSpan={5} className="border border-gray-300 px-3 py-2 text-center font-medium">諸経費（交通費込み）</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">{Math.floor(subtotal * 0.115).toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={5} className="border border-gray-300 px-3 py-2 text-center font-medium">小計</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">{(subtotal + 200000 + Math.floor(subtotal * 0.115)).toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={5} className="border border-gray-300 px-3 py-2 text-center font-medium">出精値引き</td>
                  <td className="border border-gray-300 px-3 py-2 text-right"></td>
                </tr>
                <tr>
                  <td colSpan={5} className="border border-gray-300 px-3 py-2 text-center font-medium">消費税</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">{tax.toLocaleString()}</td>
                </tr>
                <tr className="bg-orange-100">
                  <td colSpan={5} className="border border-gray-300 px-3 py-2 text-center font-bold">合計</td>
                  <td className="border border-gray-300 px-3 py-2 text-right font-bold">{total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-4 text-xs text-gray-600">
              ※ 仕様及び数量変更の場合、事前打合せのうえ、別途御見積させていただきます。
            </div>
          </div>
        </div>

        {/* 特記事項 */}
        <div className="bg-white shadow-lg mt-8 print:shadow-none print:mt-4">
          <div className="p-8">
            <h2 className="text-xl font-bold text-center mb-6 border-2 border-gray-800 py-2">お見積り追記項目</h2>
            
            <div className="space-y-6 text-sm">
              <div>
                <h3 className="font-bold text-lg mb-2">材料について</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">● 石材</span>
                    <p className="ml-4">石材は今現在の金額ですが、仕入れ状況により金額の変動も予想されます。変更があればご報告させて頂きます。</p>
                  </div>
                  <div>
                    <span className="font-medium">● 植物</span>
                    <p className="ml-4">植物に関しましては仕入れ状況により、高さ等の変更が生じる場合があります。それに伴い金額に変更が生じた場合は、ご報告後調整させて頂きます</p>
                    <p className="ml-4">高さ等はあくまで目安となります。仕入れ時の樹木の姿、形で金額は変わります</p>
                    <p className="ml-4">植栽状況にて、特に地被植物の量が多いと判断した場合は、ご請求時にその分を調整させて頂き最終ご請求を申し上げます。</p>
                  </div>
                  <div>
                    <span className="font-medium">● 枯れ木保証について</span>
                    <p className="ml-4 text-red-600">植栽した植木についての枯れ保証はされておりません</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">施工について</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">● 図面</span>
                    <p className="ml-4">図面は、あくまでイメージになります。施工中に地形の変更・植栽位置の変更が生じる場合があります。全体のバランスを確認しながらの作業となります。</p>
                  </div>
                  <div>
                    <span className="font-medium">● 施工</span>
                    <p className="ml-4">施工中は、出入りが多くなります。材料手配・材料調達等で、不在になることがありますが、家の施錠は確実にお願いいたします。</p>
                  </div>
                  <div>
                    <span className="font-medium">● トイレ</span>
                    <p className="ml-4">お手洗いはお借りすることは基本ありませんが、お持ちの簡易トイレをお庭の一部に設置させて頂きますので、ご了承ください。定期的に、汚水処へ処分させていただきますので、ご了承ください</p>
                  </div>
                  <div>
                    <span className="font-medium">● 車輌</span>
                    <p className="ml-4">基本的には敷地内での駐車をさせて頂ければ幸いです。</p>
                    <p className="ml-4">使用車両：軽トラック、移動式クレーン車、2～3トンダンプ車、その他</p>
                  </div>
                  <div>
                    <span className="font-medium">● 近隣住宅への配慮</span>
                    <p className="ml-4">作業開始日決定後、近隣住宅へ弊社より直接ご挨拶をさせて頂きます（不在の場合は、挨拶文を郵便ポストに投函させて頂きます）</p>
                  </div>
                  <div>
                    <span className="font-medium">● 電気・水道</span>
                    <p className="ml-4">作業上、電源（外部コンセント）・水道等のご支給をお願いします</p>
                  </div>
                  <div>
                    <span className="font-medium">● その他</span>
                    <p className="ml-4">予定外の作業が発生した場合（特に埋設物の有無等によるもの）は打合せをさせて頂き、作業工程の見直し、追加費用発生時は再度御見積させて頂きます</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-medium">作業時間等に関しましては、打ち合わせの上進めさせて頂きます</p>
                <p className="font-medium">基本作業時間：朝8時頃～夕方5時頃まで</p>
                <p className="text-xs">（作業内容により、大幅に時間が必要な場合は、その都度ご報告させて頂きます）</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EstimateDetailPage; 