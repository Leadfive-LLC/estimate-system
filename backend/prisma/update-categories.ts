import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCategories() {
  try {
    console.log('カテゴリーの統合を開始します...');
    
    // 芝生関連を「植栽工事」に統合
    await prisma.item.updateMany({
      where: {
        OR: [
          { name: { contains: '芝' } },
          { name: { contains: '植栽' } },
          { name: { contains: '地被' } },
          { name: { contains: '土壌改良' } }
        ]
      },
      data: {
        category: '植栽工事'
      }
    });
    
    // 土工関連を「土工工事」に統合
    await prisma.item.updateMany({
      where: {
        OR: [
          { name: { contains: '土工' } },
          { name: { contains: '土留め' } },
          { category: '土工事' }
        ]
      },
      data: {
        category: '土工工事'
      }
    });
    
    console.log('✅ カテゴリー統合が完了しました！');
    
    // 統合後のカテゴリー別集計を表示
    const categories = await prisma.item.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        category: 'asc'
      }
    });
    
    console.log('\n📊 統合後のカテゴリー別集計:');
    for (const category of categories) {
      console.log(`  ${category.category}: ${category._count.category}項目`);
    }
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCategories(); 