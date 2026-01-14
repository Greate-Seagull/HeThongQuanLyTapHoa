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
  await prisma.productCategory.deleteMany()
  await prisma.supplier.deleteMany()

  // ============================================
  // 1. SUPPLIERS (Nhà cung cấp)
  // ============================================
  console.log('Creating suppliers...')
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Công ty Nước Giải Khát Coca-Cola',
        address: '123 Đường Trần Hưng Đạo, Q1, TP.HCM',
        phoneNumber: '0281234567',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Công ty PepsiCo Việt Nam',
        address: '456 Đường Nguyễn Huệ, Q1, TP.HCM',
        phoneNumber: '0282345678',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Mondelez Kinh Đô',
        address: '789 Đường Lê Lợi, Q1, TP.HCM',
        phoneNumber: '0283456789',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Công ty Acecook Việt Nam',
        address: '321 Đường Hai Bà Trưng, Q3, TP.HCM',
        phoneNumber: '0284567890',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'TH True Milk',
        address: '654 Đường Điện Biên Phủ, Q3, TP.HCM',
        phoneNumber: '0285678901',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Unilever Việt Nam',
        address: '987 Đường Nguyễn Thị Minh Khai, Q3, TP.HCM',
        phoneNumber: '0286789012',
      },
    }),
  ])
  console.log(`✅ Created ${suppliers.length} suppliers`)

  // ============================================
  // 2. PRODUCT CATEGORIES (Loại sản phẩm)
  // ============================================
  console.log('Creating product categories...')
  const categories = await Promise.all([
    prisma.productCategory.create({
      data: {
        name: 'Đồ uống',
        description: 'Nước giải khát, nước ngọt, nước suối',
      },
    }),
    prisma.productCategory.create({
      data: {
        name: 'Snack & Bánh kẹo',
        description: 'Snack, bánh quy, kẹo các loại',
      },
    }),
    prisma.productCategory.create({
      data: {
        name: 'Mì ăn liền',
        description: 'Mì gói, mì ly các loại',
      },
    }),
    prisma.productCategory.create({
      data: {
        name: 'Sữa & Sản phẩm từ sữa',
        description: 'Sữa tươi, sữa chua, sữa đặc',
      },
    }),
    prisma.productCategory.create({
      data: {
        name: 'Chăm sóc cá nhân',
        description: 'Dầu gội, xà phòng, kem đánh răng',
      },
    }),
  ])
  console.log(`✅ Created ${categories.length} product categories`)

  // ============================================
  // 3. USERS (Customers) - Tất cả khách hàng đều có tài khoản
  // ============================================
  console.log('Creating users...')
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Nguyễn Văn An',
        point: 500, // Đã tích luỹ 500 điểm (mua 50,000đ)
      },
    }),
    prisma.user.create({
      data: {
        name: 'Trần Thị Bình',
        point: 1200, // Đã tích luỹ 1,200 điểm (mua 120,000đ)
      },
    }),
    prisma.user.create({
      data: {
        name: 'Lê Hoàng Cường',
        point: 800, // Đã tích luỹ 800 điểm (mua 80,000đ)
      },
    }),
    prisma.user.create({
      data: {
        name: 'Phạm Thị Dung',
        point: 2500, // Đã tích luỹ 2,500 điểm (mua 250,000đ)
      },
    }),
    prisma.user.create({
      data: {
        name: 'Võ Minh Em',
        point: 350, // Đã tích luỹ 350 điểm (mua 35,000đ)
      },
    }),
    prisma.user.create({
      data: {
        name: 'Đặng Thị Phương',
        point: 1500, // Đã tích luỹ 1,500 điểm (mua 150,000đ)
      },
    }),
  ])
  console.log(`✅ Created ${users.length} users`)

  // ============================================
  // 4. ACCOUNTS (Customer Login Accounts) - Tất cả user đều có account
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
    prisma.account.create({
      data: {
        userId: users[5].id,
        phoneNumber: '0956789012',
        ...generatePasswordWithSalt('123456'),
      },
    }),
  ])
  console.log(`✅ Created ${accounts.length} customer accounts`)

  // ============================================
  // 5. EMPLOYEES
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
  // 6. EMPLOYEE ACCOUNTS
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
  // 7. PRODUCTS
  // ============================================
  console.log('Creating products...')
  const products = await Promise.all([
    // Đồ uống
    prisma.product.create({
      data: {
        name: 'Coca Cola 390ml',
        unit: ProductUnit.BOTTLE,
        price: 10000,
        barcode: 11001110,
        amount: 100,
        status: ProductStatus.GOOD,
        expiryDate: new Date('2025-12-31'),
        supplierId: suppliers[0].id,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Pepsi 390ml',
        unit: ProductUnit.BOTTLE,
        price: 9500,
        barcode: 11001111,
        amount: 80,
        status: ProductStatus.GOOD,
        expiryDate: new Date('2025-11-30'),
        supplierId: suppliers[1].id,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Nước suối Lavie 500ml',
        unit: ProductUnit.BOTTLE,
        price: 5000,
        barcode: 11001112,
        amount: 200,
        status: ProductStatus.GOOD,
        expiryDate: new Date('2026-06-30'),
        supplierId: suppliers[0].id,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Sting dâu 330ml',
        unit: ProductUnit.CAN,
        price: 12000,
        barcode: 11001113,
        amount: 60,
        status: ProductStatus.GOOD,
        expiryDate: new Date('2025-09-30'),
        supplierId: suppliers[1].id,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Trà xanh 0 độ 450ml',
        unit: ProductUnit.BOTTLE,
        price: 8000,
        barcode: 11001114,
        amount: 90,
        status: ProductStatus.GOOD,
        expiryDate: new Date('2025-10-31'),
        supplierId: suppliers[0].id,
        categoryId: categories[0].id,
      },
    }),
    // Snack
    prisma.product.create({
      data: {
        name: 'Snack Ostar phô mai',
        unit: ProductUnit.PACKAGE,
        price: 7000,
        barcode: 22002220,
        amount: 50,
        status: ProductStatus.GOOD,
        expiryDate: new Date('2025-08-31'),
        supplierId: suppliers[2].id,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Snack Poca vị lẩu Thái',
        unit: ProductUnit.PACKAGE,
        price: 6500,
        barcode: 22002221,
        amount: 45,
        status: ProductStatus.GOOD,
        expiryDate: new Date('2025-07-31'),
        supplierId: suppliers[2].id,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Bánh Chocopie',
        unit: ProductUnit.BOX,
        price: 5000,
        barcode: 22002222,
        amount: 100,
        status: ProductStatus.GOOD,
        expiryDate: new Date('2025-12-31'),
        supplierId: suppliers[2].id,
        categoryId: categories[1].id,
      },
    }),
    // Mì gói
    prisma.product.create({
      data: {
        name: 'Mì Hảo Hảo tôm chua cay',
        unit: ProductUnit.PACKAGE,
        price: 4000,
        barcode: 33003330,
        amount: 150,
        status: ProductStatus.GOOD,
        expiryDate: new Date('2026-03-31'),
        supplierId: suppliers[3].id,
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Mì Kokomi tôm',
        unit: ProductUnit.PACKAGE,
        price: 3500,
        barcode: 33003331,
        amount: 120,
        status: ProductStatus.GOOD,
        expiryDate: new Date('2026-02-28'),
        supplierId: suppliers[3].id,
        categoryId: categories[2].id,
      },
    }),
    // Sữa
    prisma.product.create({
      data: {
        name: 'Sữa tươi Vinamilk 1L',
        unit: ProductUnit.BOX,
        price: 35000,
        barcode: 44004440,
        amount: 40,
        status: ProductStatus.GOOD,
        expiryDate: new Date('2025-01-15'),
        supplierId: suppliers[4].id,
        categoryId: categories[3].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Sữa chua uống TH True 180ml',
        unit: ProductUnit.BOTTLE,
        price: 8000,
        barcode: 44004441,
        amount: 70,
        status: ProductStatus.GOOD,
        expiryDate: new Date('2025-01-10'),
        supplierId: suppliers[4].id,
        categoryId: categories[3].id,
      },
    }),
    // Dầu gội, xà phòng
    prisma.product.create({
      data: {
        name: 'Dầu gội Clear Men 650ml',
        unit: ProductUnit.BOTTLE,
        price: 120000,
        barcode: 55005550,
        amount: 25,
        status: ProductStatus.GOOD,
        expiryDate: new Date('2027-12-31'),
        supplierId: suppliers[5].id,
        categoryId: categories[4].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Xà phòng Lifebuoy 90g',
        unit: ProductUnit.PIECE,
        price: 15000,
        barcode: 55005551,
        amount: 60,
        status: ProductStatus.GOOD,
        expiryDate: new Date('2027-06-30'),
        supplierId: suppliers[5].id,
        categoryId: categories[4].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Kem đánh răng PS 150g',
        unit: ProductUnit.PIECE,
        price: 25000,
        barcode: 55005552,
        amount: 50,
        status: ProductStatus.GOOD,
        expiryDate: new Date('2027-03-31'),
        supplierId: suppliers[5].id,
        categoryId: categories[4].id,
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
    products.slice(0, 15).map((product, index) => {
      // Đảm bảo quantity của slot >= amount của product
      const productAmount = product.amount
      const slotCapacity = Math.max(productAmount + Math.floor(Math.random() * 50) + 10, productAmount)
      
      return prisma.slotDetail.create({
        data: {
          slotId: slots[index % slots.length].id,
          productId: product.id,
          quantity: slotCapacity, // Slot capacity phải >= product amount
        },
      })
    })
  )
  console.log(`✅ Created ${slotDetails.length} slot details`)

  // ============================================
  // 10. GOOD RECEIPTS (Phiếu nhập hàng)
  // ============================================
  console.log('Creating good receipts...')
  const goodReceipts = await Promise.all([
    prisma.goodReceipt.create({
      data: {
        employeeId: employees[2].id, // Trần Thanh Nhập
        createdAt: new Date('2024-11-15T09:00:00'),
      },
    }),
    prisma.goodReceipt.create({
      data: {
        employeeId: employees[3].id, // Phạm Văn Hùng
        createdAt: new Date('2024-11-20T10:30:00'),
      },
    }),
    prisma.goodReceipt.create({
      data: {
        employeeId: employees[2].id,
        createdAt: new Date('2024-11-25T14:00:00'),
      },
    }),
    prisma.goodReceipt.create({
      data: {
        employeeId: employees[3].id,
        createdAt: new Date('2024-11-28T11:00:00'),
      },
    }),
    prisma.goodReceipt.create({
      data: {
        employeeId: employees[2].id,
        createdAt: new Date('2024-12-01T08:30:00'),
      },
    }),
  ])
  console.log(`✅ Created ${goodReceipts.length} good receipts`)

  // ============================================
  // 13. GOOD RECEIPT DETAILS - Realistic data
  // ============================================
  console.log('Creating good receipt details...')
  const goodReceiptDetails = await Promise.all([
    // Receipt 1 - Đồ uống
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[0].id,
        productId: products[0].id, // Coca Cola
        quantity: 100,
        price: 7000, // Cost price (sell at 10000)
      },
    }),
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[0].id,
        productId: products[1].id, // Pepsi
        quantity: 80,
        price: 6500,
      },
    }),
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[0].id,
        productId: products[2].id, // Nước suối
        quantity: 200,
        price: 3500,
      },
    }),
    // Receipt 2 - Snack
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[1].id,
        productId: products[5].id, // Ostar
        quantity: 50,
        price: 5000,
      },
    }),
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[1].id,
        productId: products[6].id, // Poca
        quantity: 45,
        price: 4500,
      },
    }),
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[1].id,
        productId: products[7].id, // Chocopie
        quantity: 100,
        price: 3500,
      },
    }),
    // Receipt 3 - Mì gói
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[2].id,
        productId: products[8].id, // Hảo Hảo
        quantity: 150,
        price: 2800,
      },
    }),
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[2].id,
        productId: products[9].id, // Kokomi
        quantity: 120,
        price: 2500,
      },
    }),
    // Receipt 4 - Sữa
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[3].id,
        productId: products[10].id, // Vinamilk
        quantity: 40,
        price: 28000,
      },
    }),
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[3].id,
        productId: products[11].id, // TH True
        quantity: 70,
        price: 6000,
      },
    }),
    // Receipt 5 - Chăm sóc cá nhân
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[4].id,
        productId: products[12].id, // Dầu gội
        quantity: 25,
        price: 95000,
      },
    }),
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[4].id,
        productId: products[13].id, // Xà phòng
        quantity: 60,
        price: 11000,
      },
    }),
    prisma.goodReceiptDetail.create({
      data: {
        goodReceiptId: goodReceipts[4].id,
        productId: products[14].id, // Kem đánh răng
        quantity: 50,
        price: 20000,
      },
    }),
  ])
  console.log(`✅ Created ${goodReceiptDetails.length} good receipt details`)

  // ============================================
  // 12. INVOICES (Hóa đơn bán hàng)
  // ============================================
  console.log('Creating invoices...')
  const invoices = await Promise.all([
    // Invoice 1: Coca x3 (10000*3*90%=27000) + Ostar x2 (7000*2*66.67%=9334) = 36334 - 50đ = 36284
    prisma.invoice.create({
      data: {
        employeeId: employees[0].id, // Lê Văn Bán
        userId: users[0].id, // Nguyễn Văn An (500 điểm)
        usedPoint: 50,
        total: 36284,
        createdAt: new Date('2024-12-01T10:30:00'),
      },
    }),
    // Invoice 2: Lavie x5 (5000*5*90%=22500) + Hảo Hảo x10 (4000*10-5000*10=-10000→0) + Vinamilk x1 (35000-10000=25000) = 47500 - 100đ = 47400
    prisma.invoice.create({
      data: {
        employeeId: employees[1].id, // Nguyễn Thị Thu
        userId: users[1].id, // Trần Thị Bình (1200 điểm)
        usedPoint: 100,
        total: 47400,
        createdAt: new Date('2024-12-03T14:15:00'),
      },
    }),
    // Invoice 3: Chocopie x5 (5000*5=25000) - không khuyến mãi
    prisma.invoice.create({
      data: {
        employeeId: employees[0].id,
        userId: users[2].id, // Lê Hoàng Cường (800 điểm)
        usedPoint: 0,
        total: 25000,
        createdAt: new Date('2024-12-05T09:45:00'),
      },
    }),
    // Invoice 4: Dầu gội x1 (120000*85%=102000) + Vinamilk x2 ((35000-10000)*2=50000) = 152000 - 200đ = 151800
    prisma.invoice.create({
      data: {
        employeeId: employees[1].id,
        userId: users[3].id, // Phạm Thị Dung (2500 điểm)
        usedPoint: 200,
        total: 151800,
        createdAt: new Date('2024-12-07T16:20:00'),
      },
    }),
    // Invoice 5: Sting x2 (12000*2*90%=21600) + Poca x2 (6500*2*66.67%=8667) = 30267 - 30đ = 30237
    prisma.invoice.create({
      data: {
        employeeId: employees[0].id,
        userId: users[4].id, // Võ Minh Em (350 điểm)
        usedPoint: 30,
        total: 30237,
        createdAt: new Date('2024-12-10T11:00:00'),
      },
    }),
    // Invoice 6: Pepsi x2 (9500*2*90%=17100) - Khách vãng lai
    prisma.invoice.create({
      data: {
        employeeId: employees[1].id,
        userId: null, // Khách vãng lai
        usedPoint: 0,
        total: 17100,
        createdAt: new Date('2024-12-12T15:30:00'),
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
  // 14. STOCKTAKING (Phiếu kiểm kê)
  // ============================================
  console.log('Creating stocktakings...')
  const stocktakings = await Promise.all([
    prisma.stocktaking.create({
      data: {
        employeeId: employees[4].id, // Nguyễn Văn Kiểm
        createdAt: new Date('2024-12-01T08:00:00'),
      },
    }),
    prisma.stocktaking.create({
      data: {
        employeeId: employees[5].id, // Lê Thị Lan
        createdAt: new Date('2024-12-10T09:30:00'),
      },
    }),
    prisma.stocktaking.create({
      data: {
        employeeId: employees[4].id, // Nguyễn Văn Kiểm
        createdAt: new Date('2024-12-20T10:00:00'),
      },
    }),
  ])
  console.log(`✅ Created ${stocktakings.length} stocktakings`)

  // ============================================
  // 15. STOCKTAKING DETAILS
  // ============================================
  console.log('Creating stocktaking details...')
  const stocktakingDetails = await Promise.all([
    // Phiếu kiểm kê 1
    prisma.stocktakingDetail.create({
      data: {
        stocktakingId: stocktakings[0].id,
        productId: products[0].id, // Coca Cola
        slotId: slots[0].id,
        status: ProductStatus.GOOD,
        quantity: 100,
      },
    }),
    prisma.stocktakingDetail.create({
      data: {
        stocktakingId: stocktakings[0].id,
        productId: products[1].id, // Pepsi
        slotId: slots[1].id,
        status: ProductStatus.GOOD,
        quantity: 80,
      },
    }),
    prisma.stocktakingDetail.create({
      data: {
        stocktakingId: stocktakings[0].id,
        productId: products[2].id, // Lavie
        slotId: slots[2].id,
        status: ProductStatus.GOOD,
        quantity: 200,
      },
    }),
    // Phiếu kiểm kê 2
    prisma.stocktakingDetail.create({
      data: {
        stocktakingId: stocktakings[1].id,
        productId: products[3].id, // Sting
        slotId: slots[3].id,
        status: ProductStatus.GOOD,
        quantity: 60,
      },
    }),
    prisma.stocktakingDetail.create({
      data: {
        stocktakingId: stocktakings[1].id,
        productId: products[4].id, // Trà xanh
        slotId: slots[4].id,
        status: ProductStatus.GOOD,
        quantity: 90,
      },
    }),
    prisma.stocktakingDetail.create({
      data: {
        stocktakingId: stocktakings[1].id,
        productId: products[5].id, // Ostar
        slotId: slots[5].id,
        status: ProductStatus.EXPIRED,
        quantity: 5,
      },
    }),
    // Phiếu kiểm kê 3
    prisma.stocktakingDetail.create({
      data: {
        stocktakingId: stocktakings[2].id,
        productId: products[8].id, // Hảo Hảo
        slotId: slots[8].id,
        status: ProductStatus.GOOD,
        quantity: 150,
      },
    }),
    prisma.stocktakingDetail.create({
      data: {
        stocktakingId: stocktakings[2].id,
        productId: products[10].id, // Sữa Vinamilk
        slotId: slots[10].id,
        status: ProductStatus.GOOD,
        quantity: 40,
      },
    }),
  ])
  console.log(`✅ Created ${stocktakingDetails.length} stocktaking details`)

  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - Suppliers: ${suppliers.length}`)
  console.log(`   - Product Categories: ${categories.length}`)
  console.log(`   - Users: ${users.length} (all with accounts)`)
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
  console.log(`   - Stocktakings: ${stocktakings.length}`)
  console.log(`   - Stocktaking Details: ${stocktakingDetails.length}`)
  console.log(`   - Good Receipts: ${goodReceipts.length}`)
  console.log(`   - Invoice: ${invoices.length}`)
  console.log('\n🔑 Test Accounts:')
  console.log('   Customers (phone/password):')
  console.log('   - 0901234567 / 123456')
  console.log('   - 0912345678 / 123456')
  console.log('   Employees (username/password):')
  console.log('   - lvban / 123456 (SALES)')
  console.log('   - ttnhap / 123456 (RECEIVING)')
  console.log('   - nvkiem / 123456 (INVENTORY)')
  console.log('   - vvquan / 123456 (MANAGER)')
  console.log('\n💡 Point System: 100,000đ = 1,000 points | 1 point = 1đ discount')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
