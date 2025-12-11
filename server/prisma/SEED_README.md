# Database Seed Guide

## 📝 Mô Tả

File seed này sẽ tạo dữ liệu mẫu đầy đủ cho hệ thống quản lý tạp hóa, bao gồm:

- **6 Users** (khách hàng) với tài khoản đăng nhập
- **7 Employees** (nhân viên) với các vị trí khác nhau
- **7 Employee Accounts** để đăng nhập
- **15 Products** (sản phẩm) đa dạng
- **5 Promotions** (khuyến mãi) đang hoạt động
- **5 Shelves** với **15 Racks** và **60 Slots**
- **5 Good Receipts** (phiếu nhập hàng)
- **6 Invoices** (hóa đơn bán hàng)
- **5 Stocktakings** (phiếu kiểm kê)

## 🚀 Cách Chạy

### 1. Đảm bảo đã cài đặt dependencies

```bash
cd server
npm install
```

### 2. Chạy migrations (nếu chưa)

```bash
npx prisma migrate dev
```

### 3. Chạy seed

```bash
npm run seed
```

Hoặc:

```bash
ts-node prisma/seed.ts
```

## 👥 Tài Khoản Test

### Khách Hàng (Customer Accounts)

| Số điện thoại | Mật khẩu | Tên            | Điểm |
|---------------|----------|----------------|------|
| 0901234567    | 123456   | Nguyễn Văn An  | 150  |
| 0912345678    | 123456   | Trần Thị Bình  | 250  |
| 0923456789    | 123456   | Lê Hoàng Cường | 100  |
| 0934567890    | 123456   | Phạm Thị Dung  | 320  |
| 0945678901    | 123456   | Võ Minh Em     | 80   |

### Nhân Viên (Employee Accounts)

| Username | Mật khẩu | Tên              | Vị trí    |
|----------|----------|------------------|-----------|
| lvban    | 123456   | Lê Văn Bán       | SALES     |
| nththu   | 123456   | Nguyễn Thị Thu   | SALES     |
| ttnhap   | 123456   | Trần Thanh Nhập  | RECEIVING |
| pvhung   | 123456   | Phạm Văn Hùng    | RECEIVING |
| nvkiem   | 123456   | Nguyễn Văn Kiểm  | INVENTORY |
| ltlan    | 123456   | Lê Thị Lan       | INVENTORY |
| vvquan   | 123456   | Võ Văn Quản      | MANAGER   |

## 📦 Sản Phẩm Mẫu

### Đồ Uống (5 sản phẩm)
- Coca Cola 390ml - 10,000đ
- Pepsi 390ml - 9,500đ
- Nước suối Lavie 500ml - 5,000đ
- Sting dâu 330ml - 12,000đ
- Trà xanh 0 độ 450ml - 8,000đ

### Snack (3 sản phẩm)
- Snack Ostar phô mai - 7,000đ
- Snack Poca vị lẩu Thái - 6,500đ
- Bánh Chocopie - 5,000đ

### Mì Gói (2 sản phẩm)
- Mì Hảo Hảo tôm chua cay - 4,000đ
- Mì Kokomi tôm - 3,500đ

### Sữa (2 sản phẩm)
- Sữa tươi Vinamilk 1L - 35,000đ
- Sữa chua uống TH True 180ml - 8,000đ

### Chăm Sóc Cá Nhân (3 sản phẩm)
- Dầu gội Clear Men 650ml - 120,000đ
- Xà phòng Lifebuoy 90g - 15,000đ
- Kem đánh răng PS 150g - 25,000đ

## 🎁 Khuyến Mãi

1. **Giảm giá đồ uống** - 10% cho tất cả đồ uống
2. **Mua 2 tặng 1 snack** - Giảm 33.33%
3. **Giảm 5000đ mì gói** - Giảm trực tiếp 5,000đ
4. **Flash Sale cuối tuần** - 15% sản phẩm chăm sóc cá nhân
5. **Khuyến mãi sữa** - Giảm 10,000đ

## 🏪 Kho Hàng

- **5 Kệ** (Shelves): A, B, C, D, E
- Mỗi kệ có **3 tầng** (Racks)
- Mỗi tầng có **4 ô** (Slots): A, B, C, D
- Tổng cộng: **60 vị trí** lưu trữ

## 📊 Dữ Liệu Giao Dịch

### Phiếu Nhập Hàng
- 5 phiếu nhập từ 2 nhân viên nhập hàng
- Mỗi phiếu có 2+ sản phẩm
- Giá nhập thấp hơn giá bán

### Hóa Đơn Bán
- 6 hóa đơn từ 2 nhân viên bán hàng
- Có cả khách hàng thành viên và khách vãng lai
- Áp dụng khuyến mãi và điểm tích lũy

### Phiếu Kiểm Kê
- 5 phiếu kiểm kê từ 2 nhân viên kiểm kê
- Kiểm tra tồn kho và trạng thái sản phẩm
- Có sản phẩm GOOD và EXPIRED

## ⚠️ Lưu Ý

- **Seed sẽ XÓA TẤT CẢ dữ liệu cũ** trước khi tạo mới
- Chỉ chạy trên database development, **KHÔNG chạy trên production**
- Mật khẩu mặc định: `123456` (đã được hash với bcrypt)
- Tất cả dữ liệu đều liên kết đầy đủ với foreign keys

## 🔄 Reset Database

Nếu muốn reset và seed lại từ đầu:

```bash
# Reset migrations
npx prisma migrate reset

# Seed sẽ tự động chạy nếu có trong prisma.seed config
# Hoặc chạy thủ công:
npm run seed
```

## 🐛 Troubleshooting

### Lỗi: "Environment variable not found: DATABASE_URL"

Đảm bảo file `.env` có biến `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

### Lỗi: "Cannot find module '@prisma/client'"

Chạy generate trước:

```bash
npx prisma generate
npm run seed
```

### Lỗi: Foreign key constraint

Đảm bảo đã chạy migrations đầy đủ:

```bash
npx prisma migrate dev
npm run seed
```

## 📈 Kết Quả Mong Đợi

Sau khi chạy seed thành công, bạn sẽ thấy:

```
🎉 Database seeding completed successfully!

📊 Summary:
   - Users: 6
   - Customer Accounts: 5
   - Employees: 7
   - Employee Accounts: 7
   - Products: 15
   - Promotions: 5
   - Promotion Details: 15
   - Shelves: 5
   - Racks: 15
   - Slots: 60
   - Slot Details: 15
   - Good Receipts: 5
   - Good Receipt Details: 10
   - Invoices: 6
   - Invoice Details: 11
   - Stocktakings: 5
   - Stocktaking Details: 15

🔑 Test Accounts:
   [Danh sách tài khoản test]
```

---

**Tạo bởi**: Seed Script Generator  
**Ngày**: December 11, 2025  
**Version**: 1.0.0
