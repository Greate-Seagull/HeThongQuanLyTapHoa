import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { prisma } from '../composition-root';

// Hash password function using bcrypt (same as PasswordService)
function hashPassword(password: string, salt: string): string {
  return bcrypt.hashSync(password, salt);
}

function generateSalt(): string {
  return bcrypt.genSaltSync(10); // saltRound = 10
}

async function seedDatabase() {
  console.log('🌱 Bắt đầu seed database...\n');

  try {
    // 1. Xóa dữ liệu cũ (theo thứ tự để tránh lỗi foreign key)
    console.log('🗑️  Xóa dữ liệu cũ...');
    await prisma.invoiceDetail.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.stocktakingDetail.deleteMany({});
    await prisma.stocktaking.deleteMany({});
    await prisma.goodReceiptDetail.deleteMany({});
    await prisma.goodReceipt.deleteMany({});
    await prisma.slotDetail.deleteMany({});
    await prisma.promotionDetail.deleteMany({});
    await prisma.promotion.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.productCategory.deleteMany({});
    await prisma.supplier.deleteMany({});
    await prisma.slot.deleteMany({});
    await prisma.rack.deleteMany({});
    await prisma.shelf.deleteMany({});
    await prisma.employeeAccount.deleteMany({});
    await prisma.employee.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Đã xóa dữ liệu cũ\n');

    // 2. Tạo Nhà cung cấp
    console.log('📦 Tạo nhà cung cấp...');
    const suppliers = await Promise.all([
      prisma.supplier.create({ data: { name: 'Công ty Coca Cola Việt Nam', phoneNumber: '0901234567' } }),
      prisma.supplier.create({ data: { name: 'Công ty PepsiCo Việt Nam', phoneNumber: '0901234568' } }),
      prisma.supplier.create({ data: { name: 'Công ty Acecook Việt Nam', phoneNumber: '0901234569' } }),
      prisma.supplier.create({ data: { name: 'Công ty Mondelez Kinh Đô', phoneNumber: '0901234570' } }),
      prisma.supplier.create({ data: { name: 'Công ty TH True Milk', phoneNumber: '0901234571' } }),
      prisma.supplier.create({ data: { name: 'Công ty Vinamilk', phoneNumber: '0901234572' } }),
    ]);
    console.log(`✅ Đã tạo ${suppliers.length} nhà cung cấp\n`);

    // 3. Tạo Loại sản phẩm
    console.log('🏷️  Tạo loại sản phẩm...');
    const categories = await Promise.all([
      prisma.productCategory.create({ data: { name: 'Nước giải khát' } }),
      prisma.productCategory.create({ data: { name: 'Mì ăn liền' } }),
      prisma.productCategory.create({ data: { name: 'Bánh kẹo' } }),
      prisma.productCategory.create({ data: { name: 'Sữa và sản phẩm từ sữa' } }),
      prisma.productCategory.create({ data: { name: 'Đồ ăn vặt' } }),
    ]);
    console.log(`✅ Đã tạo ${categories.length} loại sản phẩm\n`);

    // 4. Tạo Kệ hàng
    console.log('📚 Tạo kệ hàng...');
    const shelves = await Promise.all([
      prisma.shelf.create({ data: { name: 'Kệ A' } }),
      prisma.shelf.create({ data: { name: 'Kệ B' } }),
      prisma.shelf.create({ data: { name: 'Kệ C' } }),
    ]);

    const racks = [];
    for (const shelf of shelves) {
      for (let i = 1; i <= 3; i++) {
        const rack = await prisma.rack.create({
          data: { shelfId: shelf.id, name: `Tầng ${i}` }
        });
        racks.push(rack);
      }
    }

    const slots = [];
    for (const rack of racks) {
      for (let i = 1; i <= 5; i++) {
        const slot = await prisma.slot.create({
          data: { rackId: rack.id, name: `Ngăn ${i}` }
        });
        slots.push(slot);
      }
    }
    console.log(`✅ Đã tạo ${shelves.length} kệ, ${racks.length} tầng, ${slots.length} ngăn\n`);

    // 5. Tạo Sản phẩm
    console.log('🛍️  Tạo sản phẩm...');
    const products = await Promise.all([
      // Nước giải khát
      prisma.product.create({
        data: {
          name: 'Coca Cola 330ml',
          barcode: 123456001,
          price: 10000,
          amount: 150,
          supplierId: suppliers[0].id,
          categoryId: categories[0].id,
        }
      }),
      prisma.product.create({
        data: {
          name: 'Pepsi 330ml',
          barcode: 123456002,
          price: 9500,
          amount: 200,
          supplierId: suppliers[1].id,
          categoryId: categories[0].id,
        }
      }),
      prisma.product.create({
        data: {
          name: 'Sprite 330ml',
          barcode: 123456003,
          price: 9000,
          amount: 180,
          supplierId: suppliers[0].id,
          categoryId: categories[0].id,
        }
      }),
      // Mì ăn liền
      prisma.product.create({
        data: {
          name: 'Mì Hảo Hảo Tôm Chua Cay',
          barcode: 123456004,
          price: 4000,
          amount: 300,
          supplierId: suppliers[2].id,
          categoryId: categories[1].id,
        }
      }),
      prisma.product.create({
        data: {
          name: 'Mì Kokomi Sườn Heo',
          barcode: 123456005,
          price: 4500,
          amount: 250,
          supplierId: suppliers[2].id,
          categoryId: categories[1].id,
        }
      }),
      // Bánh kẹo
      prisma.product.create({
        data: {
          name: 'Bánh Oreo (hộp 12 gói)',
          barcode: 123456006,
          price: 48000,
          amount: 80,
          supplierId: suppliers[3].id,
          categoryId: categories[2].id,
        }
      }),
      prisma.product.create({
        data: {
          name: 'Snack Ostar Phô Mai',
          barcode: 123456007,
          price: 5000,
          amount: 200,
          supplierId: suppliers[3].id,
          categoryId: categories[4].id,
        }
      }),
      // Sữa
      prisma.product.create({
        data: {
          name: 'Sữa TH True Milk 1L',
          barcode: 123456008,
          price: 28000,
          amount: 120,
          supplierId: suppliers[4].id,
          categoryId: categories[3].id,
        }
      }),
      prisma.product.create({
        data: {
          name: 'Sữa Vinamilk Tươi 1L',
          barcode: 123456009,
          price: 30000,
          amount: 100,
          supplierId: suppliers[5].id,
          categoryId: categories[3].id,
        }
      }),
      prisma.product.create({
        data: {
          name: 'Sữa chua uống TH True Yogurt',
          barcode: 123456010,
          price: 8000,
          amount: 150,
          supplierId: suppliers[4].id,
          categoryId: categories[3].id,
        }
      }),
    ]);
    console.log(`✅ Đã tạo ${products.length} sản phẩm\n`);

    // 6. Gán vị trí cho sản phẩm
    console.log('📍 Gán vị trí cho sản phẩm...');
    for (let i = 0; i < products.length; i++) {
      await prisma.slotDetail.create({
        data: {
          productId: products[i].id,
          slotId: slots[i % slots.length].id,
        }
      });
    }
    console.log('✅ Đã gán vị trí cho sản phẩm\n');

    // 7. Tạo Nhân viên
    console.log('👥 Tạo nhân viên...');
    const employees = await Promise.all([
      prisma.employee.create({ data: { name: 'Võ Văn Quản', position: 'MANAGER' } }),
      prisma.employee.create({ data: { name: 'Lê Văn Bán', position: 'SALES' } }),
      prisma.employee.create({ data: { name: 'Nguyễn Thị Thu', position: 'SALES' } }),
      prisma.employee.create({ data: { name: 'Trần Thanh Nhập', position: 'RECEIVING' } }),
      prisma.employee.create({ data: { name: 'Phạm Văn Hùng', position: 'RECEIVING' } }),
      prisma.employee.create({ data: { name: 'Nguyễn Văn Kiểm', position: 'INVENTORY' } }),
      prisma.employee.create({ data: { name: 'Lê Thị Lan', position: 'INVENTORY' } }),
    ]);
    console.log(`✅ Đã tạo ${employees.length} nhân viên\n`);

    // 8. Tạo Tài khoản nhân viên
    console.log('🔑 Tạo tài khoản nhân viên...');
    const password = '123456';
    const accountMappings = [
      { employee: employees[0], username: 'vvquan' },
      { employee: employees[1], username: 'lvban' },
      { employee: employees[2], username: 'nththu' },
      { employee: employees[3], username: 'ttnhap' },
      { employee: employees[4], username: 'pvhung' },
      { employee: employees[5], username: 'nvkiem' },
      { employee: employees[6], username: 'ltlan' },
    ];

    for (const mapping of accountMappings) {
      const salt = generateSalt();
      const passwordHash = hashPassword(password, salt);
      await prisma.employeeAccount.create({
        data: {
          employeeId: mapping.employee.id,
          username: mapping.username,
          passwordHash,
          salt,
        }
      });
    }
    console.log('✅ Đã tạo tài khoản nhân viên (password: 123456)\n');

    // 9. Tạo Khách hàng
    console.log('👤 Tạo khách hàng...');
    const users = await Promise.all([
      prisma.user.create({ data: { name: 'Nguyễn Văn An', point: 150 } }),
      prisma.user.create({ data: { name: 'Trần Thị Bình', point: 300 } }),
      prisma.user.create({ data: { name: 'Lê Văn Châu', point: 50 } }),
      prisma.user.create({ data: { name: 'Phạm Thị Dung', point: 500 } }),
    ]);
    console.log(`✅ Đã tạo ${users.length} khách hàng\n`);

    // 10. Tạo Tài khoản khách hàng
    console.log('🔐 Tạo tài khoản khách hàng...');
    const customerPhones = ['0912345678', '0912345679', '0912345680', '0912345681'];
    for (let i = 0; i < users.length; i++) {
      const salt = generateSalt();
      const passwordHash = hashPassword(password, salt);
      await prisma.account.create({
        data: {
          userId: users[i].id,
          phoneNumber: customerPhones[i],
          passwordHash,
          salt,
        }
      });
    }
    console.log('✅ Đã tạo tài khoản khách hàng (phone: 0912345678-81, password: 123456)\n');

    // 11. Tạo Phiếu nhập hàng (tháng trước)
    console.log('📥 Tạo phiếu nhập hàng...');
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    for (let i = 0; i < 5; i++) {
      const createdAt = new Date(lastMonth);
      createdAt.setDate(createdAt.getDate() + i * 5);
      
      const goodReceipt = await prisma.goodReceipt.create({
        data: {
          employeeId: employees[3 + (i % 2)].id, // Nhân viên nhập hàng
          createdAt,
        }
      });

      // Thêm chi tiết phiếu nhập (2-4 sản phẩm mỗi phiếu)
      const numProducts = 2 + (i % 3);
      for (let j = 0; j < numProducts; j++) {
        const product = products[(i * 2 + j) % products.length];
        await prisma.goodReceiptDetail.create({
          data: {
            goodReceiptId: goodReceipt.id,
            productId: product.id,
            quantity: 50 + j * 10,
            price: Math.floor(product.price * 0.7), // Giá nhập = 70% giá bán
          }
        });
      }
    }
    console.log('✅ Đã tạo 5 phiếu nhập hàng\n');

    // 12. Tạo Hóa đơn bán hàng (tháng này)
    console.log('🧾 Tạo hóa đơn bán hàng...');
    const thisMonth = new Date();
    
    for (let i = 0; i < 20; i++) {
      const usedPoint = i % 3 === 0 ? (i % 2 === 0 ? 50 : 100) : 0;
      const userId = i % 4 === 0 ? users[i % users.length].id : null;
      
      // Tính tổng tiền trước
      const numProducts = 1 + (i % 3);
      let total = 0;
      
      const invoiceProducts = [];
      for (let j = 0; j < numProducts; j++) {
        const product = products[(i + j * 3) % products.length];
        const quantity = 1 + (j % 3);
        const subtotal = product.price * quantity;
        total += subtotal;
        invoiceProducts.push({ product, quantity });
      }
      
      const finalTotal = total - usedPoint * 100; // 1 điểm = 100đ
      
      const invoice = await prisma.invoice.create({
        data: {
          employeeId: employees[1 + (i % 2)].id, // Nhân viên bán hàng
          userId,
          usedPoint,
          total: finalTotal,
        }
      });

      // Thêm chi tiết hóa đơn
      for (const item of invoiceProducts) {
        await prisma.invoiceDetail.create({
          data: {
            invoiceId: invoice.id,
            productId: item.product.id,
            quantity: item.quantity,
          }
        });
      }
    }
    console.log('✅ Đã tạo 20 hóa đơn bán hàng\n');

    // 13. Tạo Phiếu kiểm kê
    console.log('📋 Tạo phiếu kiểm kê...');
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const stocktaking = await prisma.stocktaking.create({
      data: {
        employeeId: employees[5].id, // Nhân viên kiểm kê
        createdAt: weekAgo,
      }
    });

    for (let i = 0; i < 5; i++) {
      const product = products[i];
      const quantity = product.amount + (i % 2 === 0 ? -5 : 3); // Chênh lệch nhỏ
      
      await prisma.stocktakingDetail.create({
        data: {
          stocktakingId: stocktaking.id,
          productId: product.id,
          slotId: slots[i].id,
          status: 'GOOD',
          quantity,
        }
      });
    }
    console.log('✅ Đã tạo 1 phiếu kiểm kê\n');

    // 14. Tạo Khuyến mãi
    console.log('🎁 Tạo khuyến mãi...');
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const promotion = await prisma.promotion.create({
      data: {
        name: 'Giảm giá mùa hè',
        description: 'Giảm 10% cho các sản phẩm nước giải khát',
        startedAt: new Date(),
        endedAt: nextMonth,
        value: 10,
        promotionType: 'PERCENTAGE',
      }
    });

    // Áp dụng khuyến mãi cho nước giải khát
    for (let i = 0; i < 3; i++) {
      await prisma.promotionDetail.create({
        data: {
          promotionId: promotion.id,
          productId: products[i].id,
        }
      });
    }
    console.log('✅ Đã tạo khuyến mãi\n');

    console.log('✅✅✅ HOÀN THÀNH! ✅✅✅\n');
    console.log('📊 Tóm tắt dữ liệu:');
    console.log(`   - ${suppliers.length} nhà cung cấp`);
    console.log(`   - ${categories.length} loại sản phẩm`);
    console.log(`   - ${products.length} sản phẩm`);
    console.log(`   - ${employees.length} nhân viên`);
    console.log(`   - ${users.length} khách hàng`);
    console.log(`   - 5 phiếu nhập hàng`);
    console.log(`   - 20 hóa đơn bán hàng`);
    console.log(`   - 1 phiếu kiểm kê`);
    console.log(`   - 1 chương trình khuyến mãi`);
    console.log('\n🔑 Thông tin đăng nhập:');
    console.log('   Nhân viên:');
    console.log('     - Quản lý: vvquan / 123456');
    console.log('     - Bán hàng: lvban, nththu / 123456');
    console.log('     - Nhập hàng: ttnhap, pvhung / 123456');
    console.log('     - Kiểm kê: nvkiem, ltlan / 123456');
    console.log('   Khách hàng:');
    console.log('     - customer1, customer2, customer3, customer4 / 123456');

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase()
  .then(() => {
    console.log('\n🎉 Seed database thành công!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed thất bại:', error);
    process.exit(1);
  });
