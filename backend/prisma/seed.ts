import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // テストユーザー作成
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'テストユーザー',
      role: 'ESTIMATOR'
    }
  })

  // サンプル顧客作成
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: 'client1' },
      update: {},
      create: {
        id: 'client1',
        name: '田中太郎',
        email: 'tanaka@example.com',
        phone: '090-1234-5678',
        address: '東京都渋谷区1-1-1',
        notes: '庭の全面リニューアル希望'
      }
    }),
    prisma.client.upsert({
      where: { id: 'client2' },
      update: {},
      create: {
        id: 'client2',
        name: '佐藤花子',
        email: 'sato@example.com',
        phone: '080-9876-5432',
        address: '神奈川県横浜市2-2-2',
        notes: '芝生の張り替えと植栽'
      }
    })
  ])

  // サンプル単価マスタ作成
  const items = await Promise.all([
    // 植栽関連
    prisma.item.upsert({
      where: { id: 'item1' },
      update: {},
      create: {
        id: 'item1',
        name: '高木植栽（シマトネリコ）',
        category: '植栽',
        unit: '本',
        unitPrice: 15000,
        description: 'H=2.5m程度'
      }
    }),
    prisma.item.upsert({
      where: { id: 'item2' },
      update: {},
      create: {
        id: 'item2',
        name: '中木植栽（ヤマボウシ）',
        category: '植栽',
        unit: '本',
        unitPrice: 8000,
        description: 'H=1.5m程度'
      }
    }),
    prisma.item.upsert({
      where: { id: 'item3' },
      update: {},
      create: {
        id: 'item3',
        name: '低木植栽（アベリア）',
        category: '植栽',
        unit: '本',
        unitPrice: 2500,
        description: 'H=0.8m程度'
      }
    }),
    // 芝生関連
    prisma.item.upsert({
      where: { id: 'item4' },
      update: {},
      create: {
        id: 'item4',
        name: '芝生張り（高麗芝）',
        category: '芝生',
        unit: '㎡',
        unitPrice: 1200,
        description: '床土整備含む'
      }
    }),
    prisma.item.upsert({
      where: { id: 'item5' },
      update: {},
      create: {
        id: 'item5',
        name: '既存芝生撤去',
        category: '芝生',
        unit: '㎡',
        unitPrice: 800,
        description: '処分費含む'
      }
    }),
    // 土工事
    prisma.item.upsert({
      where: { id: 'item6' },
      update: {},
      create: {
        id: 'item6',
        name: '土壌改良',
        category: '土工事',
        unit: '㎡',
        unitPrice: 1500,
        description: '腐葉土混合'
      }
    }),
    prisma.item.upsert({
      where: { id: 'item7' },
      update: {},
      create: {
        id: 'item7',
        name: '整地作業',
        category: '土工事',
        unit: '㎡',
        unitPrice: 600,
        description: '不陸整正'
      }
    }),
    // 設備工事
    prisma.item.upsert({
      where: { id: 'item8' },
      update: {},
      create: {
        id: 'item8',
        name: '散水栓設置',
        category: '設備工事',
        unit: '箇所',
        unitPrice: 25000,
        description: '配管工事含む'
      }
    }),
    prisma.item.upsert({
      where: { id: 'item9' },
      update: {},
      create: {
        id: 'item9',
        name: 'LED照明設置',
        category: '設備工事',
        unit: '基',
        unitPrice: 18000,
        description: '電気工事含む'
      }
    }),
    // その他
    prisma.item.upsert({
      where: { id: 'item10' },
      update: {},
      create: {
        id: 'item10',
        name: '諸経費',
        category: 'その他',
        unit: '式',
        unitPrice: 50000,
        description: '現場管理費・一般管理費'
      }
    })
  ])

  console.log('✅ Seeding completed!')
  console.log(`Created user: ${user.name}`)
  console.log(`Created ${clients.length} clients`)
  console.log(`Created ${items.length} items`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 