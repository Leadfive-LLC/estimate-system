import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const realEstimateItems = [
  // 土工工事
  {
    name: '土工',
    category: '土工工事',
    unit: '式',
    unitPrice: 413500,
    description: '表土除去、整地、搬出等一式'
  },
  {
    name: '土留め石積み工',
    category: '土工工事', 
    unit: '㎡',
    unitPrice: 60000,
    description: '自然石による土留め工事'
  },

  // ガレージ工事
  {
    name: 'カーポート設置',
    category: 'ガレージ工事',
    unit: '式',
    unitPrice: 1107948,
    description: '既製品カーポート設置工事一式'
  },

  // テラス工事
  {
    name: 'テラス設置',
    category: 'テラス工事',
    unit: '式', 
    unitPrice: 396776,
    description: 'テラス屋根設置工事一式'
  },
  {
    name: 'アプローチ自然石乱張り',
    category: 'テラス工事',
    unit: '㎡',
    unitPrice: 70000,
    description: '自然石による乱張り舗装'
  },
  {
    name: 'アプローチ三和土',
    category: 'テラス工事',
    unit: '㎡',
    unitPrice: 22000,
    description: '三和土仕上げ'
  },

  // 電気工事
  {
    name: '庭園灯設置',
    category: '電気工事',
    unit: '式',
    unitPrice: 87600,
    description: '庭園灯具設置・配線工事'
  },
  {
    name: '外部コンセント設置',
    category: '電気工事', 
    unit: '箇所',
    unitPrice: 25000,
    description: '防水コンセント設置'
  },

  // ウッドフェンス建柱
  {
    name: 'ウッドフェンス建柱',
    category: 'ウッドフェンス建柱',
    unit: '式',
    unitPrice: 116170,
    description: '木製フェンス設置工事一式'
  },
  {
    name: 'フェンス基礎工事',
    category: 'ウッドフェンス建柱',
    unit: 'm',
    unitPrice: 8000,
    description: 'フェンス用基礎コンクリート打設'
  },

  // 植栽工事
  {
    name: '植栽工事',
    category: '植栽工事',
    unit: '式',
    unitPrice: 663450,
    description: '樹木・草花植栽工事一式'
  },
  {
    name: '高木植栽',
    category: '植栽工事',
    unit: '本',
    unitPrice: 15000,
    description: 'シンボルツリー等高木植栽'
  },
  {
    name: '中木植栽',
    category: '植栽工事',
    unit: '本', 
    unitPrice: 8000,
    description: '中木類植栽'
  },
  {
    name: '低木植栽',
    category: '植栽工事',
    unit: '本',
    unitPrice: 3000,
    description: '低木・灌木植栽'
  },
  {
    name: '芝張り工事',
    category: '植栽工事',
    unit: '㎡',
    unitPrice: 2500,
    description: '高麗芝張り工事'
  },

  // その他工事項目
  {
    name: '版築門柱',
    category: 'その他',
    unit: '式',
    unitPrice: 150000,
    description: '版築工法による門柱設置'
  },
  {
    name: '自然石水栓パン',
    category: 'その他',
    unit: '式',
    unitPrice: 20000,
    description: '自然石水栓パン設置'
  },
  {
    name: '設計費',
    category: 'その他',
    unit: '式',
    unitPrice: 200000,
    description: '設計・図面作成費'
  },
  {
    name: '諸経費',
    category: 'その他',
    unit: '式',
    unitPrice: 0,
    description: '現場管理費、交通費等（工事費の一定割合）'
  }
];

async function updateItems() {
  try {
    console.log('既存のアイテムを削除中...');
    await prisma.item.deleteMany({});

    console.log('新しいアイテムを登録中...');
    for (const item of realEstimateItems) {
      await prisma.item.create({
        data: item
      });
      console.log(`✓ ${item.name} (${item.category})`);
    }

    console.log(`\n✅ ${realEstimateItems.length}件のアイテムが正常に登録されました！`);
    
    // カテゴリ別の集計を表示
    const categories = [...new Set(realEstimateItems.map(item => item.category))];
    console.log('\n📊 カテゴリ別集計:');
    for (const category of categories) {
      const count = realEstimateItems.filter(item => item.category === category).length;
      console.log(`  ${category}: ${count}項目`);
    }

  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateItems(); 