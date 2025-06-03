import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const detailedItems = [
  // 植栽工事
  {
    name: 'ヤマモミジ',
    category: '植栽工事',
    specification: '株 2.0',
    unit: '本',
    purchasePrice: 18000,
    markupRate: 1.5,
    unitPrice: 27000,
    description: '落葉高木、紅葉美しい'
  },
  {
    name: 'ヤマコウバシ',
    category: '植栽工事',
    specification: '株 2.0',
    unit: '本',
    purchasePrice: 12000,
    markupRate: 1.5,
    unitPrice: 18000,
    description: '落葉低木、黄葉美しい'
  },
  {
    name: 'ジューンベリー',
    category: '植栽工事',
    specification: '株 2.0',
    unit: '本',
    purchasePrice: 12000,
    markupRate: 1.5,
    unitPrice: 18000,
    description: '落葉中木、白花・実付き'
  },
  {
    name: 'トキワヤマボウシ',
    category: '植栽工事',
    specification: '株 2.0',
    unit: '本',
    purchasePrice: 18000,
    markupRate: 1.5,
    unitPrice: 27000,
    description: '常緑中木、白花美しい'
  },
  {
    name: 'ヤマボウシ',
    category: '植栽工事',
    specification: '株 2.0',
    unit: '本',
    purchasePrice: 10000,
    markupRate: 1.5,
    unitPrice: 15000,
    description: '落葉中木、白花・実付き'
  },
  {
    name: 'ミツバウツギ',
    category: '植栽工事',
    specification: '株 0.5',
    unit: '本',
    purchasePrice: 1000,
    markupRate: 1.5,
    unitPrice: 1500,
    description: '落葉低木、白花'
  },
  {
    name: 'ドウダンツツジ',
    category: '植栽工事',
    specification: '株 1.0',
    unit: '本',
    purchasePrice: 6000,
    markupRate: 1.5,
    unitPrice: 9000,
    description: '落葉低木、白花・紅葉美しい'
  },
  {
    name: 'トケ無し柚子',
    category: '植栽工事',
    specification: '株 0.5',
    unit: '本',
    purchasePrice: 3500,
    markupRate: 1.5,
    unitPrice: 5250,
    description: '常緑低木、実用性有り'
  },
  {
    name: 'ボンカブ',
    category: '植栽工事',
    specification: '株 1.0',
    unit: '本',
    purchasePrice: 3000,
    markupRate: 1.5,
    unitPrice: 4500,
    description: '低木'
  },
  {
    name: 'ケラショウダ',
    category: '植栽工事',
    specification: '株 0.8',
    unit: '本',
    purchasePrice: 4500,
    markupRate: 1.5,
    unitPrice: 6750,
    description: '常緑低木'
  },
  {
    name: 'ジンチョウゲ',
    category: '植栽工事',
    specification: '株 0.3',
    unit: '本',
    purchasePrice: 800,
    markupRate: 1.5,
    unitPrice: 1200,
    description: '常緑低木、香りよい花'
  },
  {
    name: 'ハクサンボク',
    category: '植栽工事',
    specification: '株 1.0',
    unit: '本',
    purchasePrice: 5000,
    markupRate: 1.5,
    unitPrice: 7500,
    description: '常緑中木、白花'
  },
  {
    name: 'ナンテン',
    category: '植栽工事',
    specification: '株 1.0',
    unit: '本',
    purchasePrice: 5000,
    markupRate: 1.5,
    unitPrice: 7500,
    description: '常緑低木、赤実付き'
  },
  {
    name: 'ガラスオタガマ',
    category: '植栽工事',
    specification: '株 1.2',
    unit: '本',
    purchasePrice: 5000,
    markupRate: 1.5,
    unitPrice: 7500,
    description: '常緑低木'
  },
  {
    name: '芝生',
    category: '植栽工事',
    specification: '高麗芝',
    unit: '㎡',
    purchasePrice: 580,
    markupRate: 1.5,
    unitPrice: 870,
    description: '高麗芝張り工事'
  },
  {
    name: '地被植物',
    category: '植栽工事',
    specification: '混合植栽',
    unit: '㎡',
    purchasePrice: 7000,
    markupRate: 1.5,
    unitPrice: 10500,
    description: 'グランドカバー植物'
  },
  {
    name: '土壌改良材',
    category: '植栽工事',
    specification: '有機質土壌改良',
    unit: '㎡',
    purchasePrice: 380,
    markupRate: 1.5,
    unitPrice: 570,
    description: '植栽用土壌改良材'
  },
  {
    name: '芝目土',
    category: '植栽工事',
    specification: '芝生用目土',
    unit: '㎡',
    purchasePrice: 10000,
    markupRate: 1.5,
    unitPrice: 15000,
    description: '芝生用目土敷設'
  },
  {
    name: '施工費（買付含む）',
    category: '植栽工事',
    specification: '植栽工事一式',
    unit: '式',
    purchasePrice: 26000,
    markupRate: 1.5,
    unitPrice: 39000,
    description: '植栽施工・買付手数料'
  },
  {
    name: '運搬費',
    category: '植栽工事',
    specification: '材料運搬',
    unit: '式',
    purchasePrice: 18000,
    markupRate: 1.5,
    unitPrice: 27000,
    description: '植栽材料運搬費'
  },

  // ガレージ工事
  {
    name: 'カーポート（加藤ライザードワイド）',
    category: 'ガレージ工事',
    specification: '54-50 H25 柱 ポリカ',
    unit: '式',
    purchasePrice: null,
    markupRate: 1.5,
    unitPrice: 0,
    description: 'ライザードワイド カーポート本体'
  },
  {
    name: 'カーポート施工費',
    category: 'ガレージ工事',
    specification: '組立・設置工事',
    unit: '式',
    purchasePrice: 76800,
    markupRate: 1.5,
    unitPrice: 76800,
    description: 'カーポート組立設置'
  },
  {
    name: '土間コンクリート（メッシュ筋無し）',
    category: 'ガレージ工事',
    specification: 'コンクリート打設',
    unit: '㎡',
    purchasePrice: 267,
    markupRate: 1.5,
    unitPrice: 267,
    description: '駐車場土間コンクリート'
  },
  {
    name: '間接目地',
    category: 'ガレージ工事',
    specification: '目地材設置',
    unit: 'm',
    purchasePrice: 778,
    markupRate: 1.5,
    unitPrice: 778,
    description: 'コンクリート間接目地'
  },
  {
    name: '型枠工',
    category: 'ガレージ工事',
    specification: 'コンクリート型枠',
    unit: '式',
    purchasePrice: 6000,
    markupRate: 1.5,
    unitPrice: 6000,
    description: 'コンクリート型枠設置撤去'
  },

  // テラス工事
  {
    name: 'テラス（YKK）ソラリア 柱標準タイプ',
    category: 'テラス工事',
    specification: '前面パネル2段ポリカ 定価201,000円',
    unit: '式',
    purchasePrice: 99495,
    markupRate: 1.5,
    unitPrice: 99495,
    description: 'YKK ソラリア テラス本体'
  },
  {
    name: '前面パネルすき間調整',
    category: 'テラス工事',
    specification: '定価35,500円',
    unit: '式',
    purchasePrice: 17573,
    markupRate: 1.5,
    unitPrice: 17573,
    description: 'テラス前面パネル調整材'
  },
  {
    name: 'テラス・パネル施工費',
    category: 'テラス工事',
    specification: '組立・設置工事',
    unit: '式',
    purchasePrice: 68800,
    markupRate: 1.5,
    unitPrice: 68800,
    description: 'テラス組立設置工事'
  },
  {
    name: '土間コンクリート（メッシュ筋・下地材）',
    category: 'テラス工事',
    specification: 'メッシュ筋入りコンクリート',
    unit: '㎡',
    purchasePrice: 1520,
    markupRate: 1.5,
    unitPrice: 1520,
    description: 'テラス下土間コンクリート'
  },
  {
    name: '型枠工',
    category: 'テラス工事',
    specification: 'コンクリート型枠',
    unit: '式',
    purchasePrice: 6000,
    markupRate: 1.5,
    unitPrice: 6000,
    description: 'コンクリート型枠設置撤去'
  },
  {
    name: '表枠土（目張石）',
    category: 'テラス工事',
    specification: '仕上げ材',
    unit: '式',
    purchasePrice: 27500,
    markupRate: 1.5,
    unitPrice: 27500,
    description: '表面仕上げ・目張石'
  },

  // 電気工事
  {
    name: 'ポールライト（パナ）',
    category: '電気工事',
    specification: 'XLG E5033BK',
    unit: '基',
    purchasePrice: null,
    markupRate: 1.5,
    unitPrice: 0,
    description: 'パナソニック製ポールライト'
  },
  {
    name: '屋外電気配線工事',
    category: '電気工事',
    specification: '配線・接続工事',
    unit: '箇所',
    purchasePrice: 2000,
    markupRate: 1.5,
    unitPrice: 6000,
    description: '屋外電気配線工事'
  },
  {
    name: '電気工事（照明器具・インターホン）',
    category: '電気工事',
    specification: '器具取付・接続',
    unit: '箇所',
    purchasePrice: 2000,
    markupRate: 1.5,
    unitPrice: 6000,
    description: '照明器具・インターホン工事'
  },
  {
    name: '副資材',
    category: '電気工事',
    specification: '電気工事副資材',
    unit: '式',
    purchasePrice: 6240,
    markupRate: 1.5,
    unitPrice: 6240,
    description: '電気工事用副資材'
  },

  // ウッドフェンス建柱
  {
    name: 'アルミ角柱 50×50×4000',
    category: 'ウッドフェンス建柱',
    specification: '定価18,700円',
    unit: '本',
    purchasePrice: 1443,
    markupRate: 1.5,
    unitPrice: 1443,
    description: 'アルミ角柱 4m'
  },
  {
    name: 'アルミ角柱 50×2400',
    category: 'ウッドフェンス建柱',
    specification: '定価11,200円',
    unit: '本',
    purchasePrice: 6050,
    markupRate: 1.5,
    unitPrice: 6050,
    description: 'アルミ角柱 2.4m'
  },
  {
    name: '天端キャップ 50',
    category: 'ウッドフェンス建柱',
    specification: '定価540円',
    unit: '個',
    purchasePrice: 33,
    markupRate: 1.5,
    unitPrice: 33,
    description: 'アルミ角柱用キャップ'
  },
  {
    name: 'アルミ角柱施工費',
    category: 'ウッドフェンス建柱',
    specification: '建柱・設置工事',
    unit: '本',
    purchasePrice: 127,
    markupRate: 1.5,
    unitPrice: 127,
    description: 'アルミ角柱設置工事'
  }
];

async function updateDetailedItems() {
  try {
    console.log('既存のアイテムを削除中...');
    await prisma.item.deleteMany({});

    console.log('新しい詳細アイテムを登録中...');
    for (const item of detailedItems) {
      await prisma.item.create({
        data: item
      });
      console.log(`✓ ${item.name} (${item.category}) - ¥${item.unitPrice.toLocaleString()}`);
    }

    console.log(`\n✅ ${detailedItems.length}件の詳細アイテムが正常に登録されました！`);
    
    // カテゴリ別の集計を表示
    const categories = [...new Set(detailedItems.map(item => item.category))];
    console.log('\n📊 カテゴリ別集計:');
    for (const category of categories) {
      const categoryItems = detailedItems.filter(item => item.category === category);
      const count = categoryItems.length;
      const totalValue = categoryItems.reduce((sum, item) => sum + Number(item.unitPrice), 0);
      console.log(`  ${category}: ${count}項目 (合計参考価格: ¥${totalValue.toLocaleString()})`);
    }

  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDetailedItems(); 