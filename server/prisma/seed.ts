import { config } from 'dotenv'
import { PrismaClient, EmployeePosition, ProductUnit, ProductStatus, PromotionType } from '../src/generated/client'
import { PasswordService } from '../src/domain/services/encrypt.service'

// Load environment variables from .env file
config()

const prisma = new PrismaClient()
const passwordService = new PasswordService(10) // saltRound = 10

// Helper function to generate password with salt
function generatePasswordWithSalt(password: string) {
  const salt = passwordService.generateSalt()
  const passwordHash = passwordService.hashPassword(password, salt)
  return { passwordHash, salt }
}

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data (in reverse order of dependencies)
  console.log('Clearing existing data...')
  await prisma.stocktakingDetail.deleteMany()
  await prisma.stocktaking.deleteMany()
  await prisma.slotDetail.deleteMany()
  await prisma.slot.deleteMany()
  await prisma.rack.deleteMany()
  await prisma.shelf.deleteMany()
  await prisma.goodReceiptDetail.deleteMany()
  await prisma.goodReceipt.deleteMany()
  await prisma.invoiceDetail.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.promotionDetail.deleteMany()
  await prisma.promotion.deleteMany()
  await prisma.employeeAccount.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.product.deleteMany()

  // ============================================
  // 1. USERS (Customers)
  // ============================================
  console.log('Creating users...')
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Nguyễn Văn An',
        point: 150,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Trần Thị Bình',
        point: 250,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Lê Hoàng Cường',
        point: 100,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Phạm Thị Dung',
        point: 320,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Võ Minh Em',
        point: 80,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Đặng Thị Phương',
        point: 200,
      },
    }),
  ])
  console.log(`✅ Created ${users.length} users`)

  // ============================================
  // 2. ACCOUNTS (Customer Login Accounts)
  // ============================================
  console.log('Creating customer accounts...')
  const accounts = await Promise.all([
    prisma.account.create({
      data: {
        userId: users[0].id,
        phoneNumber: '0901234567',
        ...generatePasswordWithSalt('123456'),
      },
    }),
    prisma.account.create({
      data: {
        userId: users[1].id,
        phoneNumber: '0912345678',
        ...generatePasswordWithSalt('123456'),
      },
    }),
    prisma.account.create({
      data: {
        userId: users[2].id,
        phoneNumber: '0923456789',
        ...generatePasswordWithSalt('123456'),
      },
    }),
    prisma.account.create({
      data: {
        userId: users[3].id,
        phoneNumber: '0934567890',
        ...generatePasswordWithSalt('123456'),
      },
    }),
    prisma.account.create({
      data: {
        userId: users[4].id,
        phoneNumber: '0945678901',
        ...generatePasswordWithSalt('123456'),
      },
    }),
  ])
  console.log(`✅ Created ${accounts.length} customer accounts`)

  // ============================================
  // 3. EMPLOYEES
  // ============================================
  console.log('Creating employees...')
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        name: 'Lê Văn Bán',
        position: EmployeePosition.SALES,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Nguyễn Thị Thu',
        position: EmployeePosition.SALES,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Trần Thanh Nhập',
        position: EmployeePosition.RECEIVING,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Phạm Văn Hùng',
        position: EmployeePosition.RECEIVING,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Nguyễn Văn Kiểm',
        position: EmployeePosition.INVENTORY,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Lê Thị Lan',
        position: EmployeePosition.INVENTORY,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Võ Văn Quản',
        position: EmployeePosition.MANAGER,
      },
    }),
  ])
  console.log(`✅ Created ${employees.length} employees`)

  // ============================================
  // 4. EMPLOYEE ACCOUNTS
  // ============================================
  console.log('Creating employee accounts...')
  const employeeAccounts = await Promise.all([
    prisma.employeeAccount.create({
      data: {
        employeeId: employees[0].id,
        username: 'lvban',
        ...generatePasswordWithSalt('123456'),
      },
    }),
    prisma.employeeAccount.create({
      data: {
        employeeId: employees[1].id,
        username: 'nththu',
        ...generatePasswordWithSalt('123456'),
      },
    }),
    prisma.employeeAccount.create({
      data: {
        employeeId: employees[2].id,
        username: 'ttnhap',
        ...generatePasswordWithSalt('123456'),
      },
    }),
    prisma.employeeAccount.create({
      data: {
        employeeId: employees[3].id,
        username: 'pvhung',
        ...generatePasswordWithSalt('123456'),
      },
    }),
    prisma.employeeAccount.create({
      data: {
        employeeId: employees[4].id,
        username: 'nvkiem',
        ...generatePasswordWithSalt('123456'),
      },
    }),
    prisma.employeeAccount.create({
      data: {
        employeeId: employees[5].id,
        username: 'ltlan',
        ...generatePasswordWithSalt('123456'),
      },
    }),
    prisma.employeeAccount.create({
      data: {
        employeeId: employees[6].id,
        username: 'vvquan',
        ...generatePasswordWithSalt('123456'),
      },
    }),
  ])
  console.log(`✅ Created ${employeeAccounts.length} employee accounts`)

  // ============================================
  // 5. PRODUCTS
  // ============================================
  console.log('Creating products...')
  const products = await Promise.all([
    // Đồ uống
    prisma.product.create({
      data: {
        name: 'Coca Cola 390ml',
        unit: ProductUnit.UNKNOWN,
        price: 10000,
        barcode: 11001110,
        amount: 100,
        status: ProductStatus.GOOD,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Pepsi 390ml',
        unit: ProductUnit.UNKNOWN,
        price: 9500,
        barcode: 11001111,
        amount: 80,
        status: ProductStatus.GOOD,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Nước suối Lavie 500ml',
        unit: ProductUnit.UNKNOWN,
        price: 5000,
        barcode: 11001112,
        amount: 200,
        status: ProductStatus.GOOD,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Sting dâu 330ml',
        unit: ProductUnit.UNKNOWN,
        price: 12000,
        barcode: 11001113,
        amount: 60,
        status: ProductStatus.GOOD,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Trà xanh 0 độ 450ml',
        unit: ProductUnit.UNKNOWN,
        price: 8000,
        barcode: 11001114,
        amount: 90,
        status: ProductStatus.GOOD,
      },
    }),
    // Snack
    prisma.product.create({
      data: {
        name: 'Snack Ostar phô mai',
        unit: ProductUnit.UNKNOWN,
        price: 7000,
        barcode: 22002220,
        amount: 50,
        status: ProductStatus.GOOD,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Snack Poca vị lẩu Thái',
        unit: ProductUnit.UNKNOWN,
        price: 6500,
        barcode: 22002221,
        amount: 45,
        status: ProductStatus.GOOD,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Bánh Chocopie',
        unit: ProductUnit.UNKNOWN,
        price: 5000,
        barcode: 22002222,
        amount: 100,
        status: ProductStatus.GOOD,
      },
    }),
    // Mì gói
    prisma.product.create({
      data: {
        name: 'Mì Hảo Hảo tôm chua cay',
        unit: ProductUnit.UNKNOWN,
        price: 4000,
        barcode: 33003330,
        amount: 150,
        status: ProductStatus.GOOD,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Mì Kokomi tôm',
        unit: ProductUnit.UNKNOWN,
        price: 3500,
        barcode: 33003331,
        amount: 120,
        status: ProductStatus.GOOD,
      },
    }),
    // Sữa
    prisma.product.create({
      data: {
        name: 'Sữa tươi Vinamilk 1L',
        unit: ProductUnit.UNKNOWN,
        price: 35000,
        barcode: 44004440,
        amount: 40,
        status: ProductStatus.GOOD,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Sữa chua uống TH True 180ml',
        unit: ProductUnit.UNKNOWN,
        price: 8000,
        barcode: 44004441,
        amount: 70,
        status: ProductStatus.GOOD,
      },
    }),
    // Dầu gội, xà phòng
    prisma.product.create({
      data: {
        name: 'Dầu gội Clear Men 650ml',
        unit: ProductUnit.UNKNOWN,
        price: 120000,
        barcode: 55005550,
        amount: 25,
        status: ProductStatus.GOOD,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Xà phòng Lifebuoy 90g',
        unit: ProductUnit.UNKNOWN,
        price: 15000,
        barcode: 55005551,
        amount: 60,
        status: ProductStatus.GOOD,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Kem đánh răng PS 150g',
        unit: ProductUnit.UNKNOWN,
        price: 25000,
        barcode: 55005552,
        amount: 50,
        status: ProductStatus.GOOD,
      },
    }),
  ])
  console.log(`✅ Created ${products.length} products`)

  // ============================================
  // 6. PROMOTIONS
  // ============================================
  console.log('Creating promotions...')
  const now = new Date()
  const promotions = await Promise.all([
    prisma.promotion.create({
      data: {
        name: 'Giảm giá đồ uống',
        description: 'Giảm 10% cho tất cả đồ uống',
        startedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        endedAt: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000), // 23 days later
        condition: 'Áp dụng cho tất cả đồ uống',
        value: 10,
        promotionType: PromotionType.PERCENTAGE,
      },
    }),
    prisma.promotion.create({
      data: {
        name: 'Mua 2 tặng 1 snack',
        description: 'Mua 2 gói snack tặng 1 gói',
        startedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        endedAt: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        condition: 'Mua 2 tặng 1',
        value: 33.33,
        promotionType: PromotionType.PERCENTAGE,
      },
    }),
    prisma.promotion.create({
      data: {
        name: 'Giảm 5000đ mì gói',
        description: 'Giảm 5000đ khi mua mì gói',
        startedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        endedAt: new Date(now.getTime() + 27 * 24 * 60 * 60 * 1000),
        condition: 'Giảm trực tiếp',
        value: 5000,
        promotionType: PromotionType.FIXED,
      },
    }),
    prisma.promotion.create({
      data: {
        name: 'Flash Sale cuối tuần',
        description: 'Giảm 15% các sản phẩm chăm sóc cá nhân',
        startedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        endedAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        condition: 'Chỉ áp dụng cuối tuần',
        value: 15,
        promotionType: PromotionType.PERCENTAGE,
      },
    }),
    prisma.promotion.create({
      data: {
        name: 'Khuyến mãi sữa',
        description: 'Giảm 10000đ khi mua sữa',
        startedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        endedAt: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        condition: 'Áp dụng cho sản phẩm sữa',
        value: 10000,
        promotionType: PromotionType.FIXED,
      },
    }),
  ])
  console.log(`✅ Created ${promotions.length} promotions`)

  // ============================================
  // 7. PROMOTION DETAILS
  // ============================================
  console.log('Creating promotion details...')
  const promotionDetails = await Promise.all([
    // Promotion 1: Giảm giá đồ uống (products 0-4)
    ...products.slice(0, 5).map((product) =>
      prisma.promotionDetail.create({
        data: {
          productId: product.id,
          promotionId: promotions[0].id,
        },
      })
    ),
    // Promotion 2: Mua 2 tặng 1 snack (products 5-7)
    ...products.slice(5, 8).map((product) =>
      prisma.promotionDetail.create({
        data: {
          productId: product.id,
          promotionId: promotions[1].id,
        },
      })
    ),
    // Promotion 3: Giảm 5000đ mì gói (products 8-9)
    ...products.slice(8, 10).map((product) =>
      prisma.promotionDetail.create({
        data: {
          productId: product.id,
          promotionId: promotions[2].id,
        },
      })
    ),
    // Promotion 4: Flash Sale (products 12-14 - chăm sóc cá nhân)
    ...products.slice(12, 15).map((product) =>
      prisma.promotionDetail.create({
        data: {
          productId: product.id,
          promotionId: promotions[3].id,
        },
      })
    ),
    // Promotion 5: Khuyến mãi sữa (products 10-11)
    ...products.slice(10, 12).map((product) =>
      prisma.promotionDetail.create({
        data: {
          productId: product.id,
          promotionId: promotions[4].id,
        },
      })
    ),
  ])
  console.log(`✅ Created ${promotionDetails.length} promotion details`)

  // ============================================
  // 8. SHELVES, RACKS, SLOTS
  // ============================================
  console.log('Creating shelves, racks, and slots...')
  const shelves = await Promise.all([
    prisma.shelf.create({ data: { name: 'Kệ A - Đồ uống' } }),
    prisma.shelf.create({ data: { name: 'Kệ B - Thực phẩm' } }),
    prisma.shelf.create({ data: { name: 'Kệ C - Chăm sóc cá nhân' } }),
    prisma.shelf.create({ data: { name: 'Kệ D - Gia vị' } }),
    prisma.shelf.create({ data: { name: 'Kệ E - Đồ dùng' } }),
  ])

  const racks = await Promise.all(
    shelves.flatMap((shelf, shelfIndex) =>
      Array.from({ length: 3 }, (_, rackIndex) =>
        prisma.rack.create({
          data: {
            name: `Tầng ${rackIndex + 1}`,
            shelfId: shelf.id,
          },
        })
      )
    )
  )

  const slots = await Promise.all(
    racks.flatMap((rack, rackIndex) =>
      Array.from({ length: 4 }, (_, slotIndex) =>
        prisma.slot.create({
          data: {
            name: `Ô ${String.fromCharCode(65 + slotIndex)}`,
            rackId: rack.id,
          },
        })
      )
    )
  )
  console.log(`✅ Created ${shelves.length} shelves, ${racks.length} racks, ${slots.length} slots`)

  // ============================================
  // 9. SLOT DETAILS (Product Locations)
  // ============================================
  console.log('Creating slot details...')
  const slotDetails = await Promise.all(
    products.slice(0, 15).map((product, index) =>
      prisma.slotDetail.create({
        data: {
          slotId: slots[index % slots.length].id,
          productId: product.id,
        },
      })
    )
  )
  console.log(`✅ Created ${slotDetails.length} slot details`)

  // ============================================
  // 10. GOOD RECEIPTS (Phiếu nhập hàng)
  // ============================================
  console.log('Creating good receipts...')
  const goodReceipts = await Promise.all([
    prisma.goodReceipt.create({
      data: {
        employeeId: employees[2].id, // Nhân viên nhập hàng 1
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.goodReceipt.create({
      data: {
        employeeId: employees[3].id, // Nhân viên nhập hàng 2
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.goodReceipt.create({
      data: {
        employeeId: employees[2].id,
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.goodReceipt.create({
      data: {
        employeeId: employees[3].id,
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.goodReceipt.create({
      data: {
        employeeId: employees[2].id,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
  ])
  console.log(`✅ Created ${goodReceipts.length} good receipts`)

  // ============================================
  // 11. GOOD RECEIPT DETAILS
  // ============================================
  console.log('Creating good receipt details...')
  const goodReceiptDetails = await Promise.all([
    // Receipt 1
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[0].id,
        productId: products[0].id,
        quantity: 50,
        price: 8000,
      },
    }),
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[0].id,
        productId: products[1].id,
        quantity: 40,
        price: 7500,
      },
    }),
    // Receipt 2
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[1].id,
        productId: products[5].id,
        quantity: 30,
        price: 5000,
      },
    }),
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[1].id,
        productId: products[6].id,
        quantity: 25,
        price: 4800,
      },
    }),
    // Receipt 3
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[2].id,
        productId: products[8].id,
        quantity: 100,
        price: 3000,
      },
    }),
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[2].id,
        productId: products[9].id,
        quantity: 80,
        price: 2800,
      },
    }),
    // Receipt 4
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[3].id,
        productId: products[10].id,
        quantity: 20,
        price: 28000,
      },
    }),
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[3].id,
        productId: products[11].id,
        quantity: 40,
        price: 6500,
      },
    }),
    // Receipt 5
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[4].id,
        productId: products[12].id,
        quantity: 15,
        price: 100000,
      },
    }),
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[4].id,
        productId: products[13].id,
        quantity: 30,
        price: 12000,
      },
    }),
  ])
  console.log(`✅ Created ${goodReceiptDetails.length} good receipt details`)

  // ============================================
  // 12. INVOICES (Hóa đơn bán hàng)
  // ============================================
  console.log('Creating invoices...')
  const invoices = await Promise.all([
    prisma.invoice.create({
      data: {
        employeeId: employees[0].id, // Nhân viên bán hàng 1
        userId: users[0].id,
        usedPoint: 50,
        total: 45000,
      },
    }),
    prisma.invoice.create({
      data: {
        employeeId: employees[1].id, // Nhân viên bán hàng 2
        userId: users[1].id,
        usedPoint: 100,
        total: 80000,
      },
    }),
    prisma.invoice.create({
      data: {
        employeeId: employees[0].id,
        userId: users[2].id,
        usedPoint: 0,
        total: 25000,
      },
    }),
    prisma.invoice.create({
      data: {
        employeeId: employees[1].id,
        userId: users[3].id,
        usedPoint: 200,
        total: 150000,
      },
    }),
    prisma.invoice.create({
      data: {
        employeeId: employees[0].id,
        userId: users[4].id,
        usedPoint: 30,
        total: 35000,
      },
    }),
    prisma.invoice.create({
      data: {
        employeeId: employees[1].id,
        userId: null, // Khách vãng lai
        usedPoint: 0,
        total: 20000,
      },
    }),
  ])
  console.log(`✅ Created ${invoices.length} invoices`)

  // ============================================
  // 13. INVOICE DETAILS
  // ============================================
  console.log('Creating invoice details...')
  const invoiceDetails = await Promise.all([
    // Invoice 1
    prisma.invoiceDetail.create({
      data: {
        invoiceId: invoices[0].id,
        productId: products[0].id,
        quantity: 3,
        promotionId: promotions[0].id,
      },
    }),
    prisma.invoiceDetail.create({
      data: {
        invoiceId: invoices[0].id,
        productId: products[5].id,
        quantity: 2,
        promotionId: promotions[1].id,
      },
    }),
    // Invoice 2
    prisma.invoiceDetail.create({
      data: {
        invoiceId: invoices[1].id,
        productId: products[2].id,
        quantity: 5,
        promotionId: promotions[0].id,
      },
    }),
    prisma.invoiceDetail.create({
      data: {
        invoiceId: invoices[1].id,
        productId: products[8].id,
        quantity: 10,
        promotionId: promotions[2].id,
      },
    }),
    prisma.invoiceDetail.create({
      data: {
        invoiceId: invoices[1].id,
        productId: products[10].id,
        quantity: 1,
        promotionId: promotions[4].id,
      },
    }),
    // Invoice 3
    prisma.invoiceDetail.create({
      data: {
        invoiceId: invoices[2].id,
        productId: products[7].id,
        quantity: 5,
        promotionId: null,
      },
    }),
    // Invoice 4
    prisma.invoiceDetail.create({
      data: {
        invoiceId: invoices[3].id,
        productId: products[12].id,
        quantity: 1,
        promotionId: promotions[3].id,
      },
    }),
    prisma.invoiceDetail.create({
      data: {
        invoiceId: invoices[3].id,
        productId: products[10].id,
        quantity: 2,
        promotionId: promotions[4].id,
      },
    }),
    // Invoice 5
    prisma.invoiceDetail.create({
      data: {
        invoiceId: invoices[4].id,
        productId: products[3].id,
        quantity: 2,
        promotionId: promotions[0].id,
      },
    }),
    prisma.invoiceDetail.create({
      data: {
        invoiceId: invoices[4].id,
        productId: products[6].id,
        quantity: 2,
        promotionId: promotions[1].id,
      },
    }),
    // Invoice 6
    prisma.invoiceDetail.create({
      data: {
        invoiceId: invoices[5].id,
        productId: products[1].id,
        quantity: 2,
        promotionId: promotions[0].id,
      },
    }),
  ])
  console.log(`✅ Created ${invoiceDetails.length} invoice details`)

  // ============================================
  // 14. STOCKTAKINGS (Phiếu kiểm kê)
  // ============================================
  console.log('Creating stocktakings...')
  const stocktakings = await Promise.all([
    prisma.stocktaking.create({
      data: {
        employeeId: employees[4].id, // Nhân viên kiểm kê 1
        createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.stocktaking.create({
      data: {
        employeeId: employees[5].id, // Nhân viên kiểm kê 2
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.stocktaking.create({
      data: {
        employeeId: employees[4].id,
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.stocktaking.create({
      data: {
        employeeId: employees[5].id,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.stocktaking.create({
      data: {
        employeeId: employees[4].id,
        createdAt: new Date(),
      },
    }),
  ])
  console.log(`✅ Created ${stocktakings.length} stocktakings`)

  // ============================================
  // 15. STOCKTAKING DETAILS
  // ============================================
  console.log('Creating stocktaking details...')
  const stocktakingDetails = await Promise.all([
    // Stocktaking 1
    ...products.slice(0, 5).map((product, index) =>
      prisma.stocktakingDetail.create({
        data: {
          stocktakingId: stocktakings[0].id,
          productId: product.id,
          slotId: slots[index].id,
          status: ProductStatus.GOOD,
          quantity: Math.floor(Math.random() * 50) + 50,
        },
      })
    ),
    // Stocktaking 2
    ...products.slice(5, 10).map((product, index) =>
      prisma.stocktakingDetail.create({
        data: {
          stocktakingId: stocktakings[1].id,
          productId: product.id,
          slotId: slots[index + 5].id,
          status: ProductStatus.GOOD,
          quantity: Math.floor(Math.random() * 40) + 40,
        },
      })
    ),
    // Stocktaking 3
    ...products.slice(10, 15).map((product, index) =>
      prisma.stocktakingDetail.create({
        data: {
          stocktakingId: stocktakings[2].id,
          productId: product.id,
          slotId: slots[index + 10].id,
          status: index % 5 === 4 ? ProductStatus.EXPIRED : ProductStatus.GOOD,
          quantity: Math.floor(Math.random() * 30) + 30,
        },
      })
    ),
  ])
  console.log(`✅ Created ${stocktakingDetails.length} stocktaking details`)

  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - Users: ${users.length}`)
  console.log(`   - Customer Accounts: ${accounts.length}`)
  console.log(`   - Employees: ${employees.length}`)
  console.log(`   - Employee Accounts: ${employeeAccounts.length}`)
  console.log(`   - Products: ${products.length}`)
  console.log(`   - Promotions: ${promotions.length}`)
  console.log(`   - Promotion Details: ${promotionDetails.length}`)
  console.log(`   - Shelves: ${shelves.length}`)
  console.log(`   - Racks: ${racks.length}`)
  console.log(`   - Slots: ${slots.length}`)
  console.log(`   - Slot Details: ${slotDetails.length}`)
  console.log(`   - Good Receipts: ${goodReceipts.length}`)
  console.log(`   - Good Receipt Details: ${goodReceiptDetails.length}`)
  console.log(`   - Invoices: ${invoices.length}`)
  console.log(`   - Invoice Details: ${invoiceDetails.length}`)
  console.log(`   - Stocktakings: ${stocktakings.length}`)
  console.log(`   - Stocktaking Details: ${stocktakingDetails.length}`)
  console.log('\n🔑 Test Accounts:')
  console.log('   Customers (phone/password):')
  console.log('   - 0901234567 / 123456')
  console.log('   - 0912345678 / 123456')
  console.log('   Employees (username/password):')
  console.log('   - lvban / 123456 (SALES)')
  console.log('   - ttnhap / 123456 (RECEIVING)')
  console.log('   - nvkiem / 123456 (INVENTORY)')
  console.log('   - vvquan / 123456 (MANAGER)')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
