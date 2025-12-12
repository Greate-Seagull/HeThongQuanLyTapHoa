# 📊 Hệ Thống Báo Cáo - Hướng Dẫn Sử Dụng

## ✅ Đã Hoàn Thành

### Backend
- ✅ ReportReadAccessor với 6 phương thức query Prisma
- ✅ 6 Use cases cho từng loại báo cáo
- ✅ API Routes: `/reports/*` với 6 endpoints
- ✅ ExcelExportService (backend - optional)
- ✅ Đã cài đặt thư viện `exceljs`

### Frontend  
- ✅ report.service.ts với API calls và export Excel
- ✅ Reports.tsx UI hoàn chỉnh với:
  - Combobox chọn loại báo cáo
  - Date range picker cho báo cáo theo thời gian
  - Nút "Xem báo cáo" và "Xuất Excel"
  - Summary cards động theo từng loại báo cáo
- ✅ Đã cài đặt thư viện `exceljs`, `file-saver`

---

## 📋 Các Loại Báo Cáo

### 1. Báo Cáo Tồn Kho
**Endpoint:** `GET /reports/inventory?lowStockThreshold=10`

**Thông tin:**
- Danh sách sản phẩm còn lại trong kho
- Sản phẩm sắp hết hàng (< threshold)
- Vị trí sản phẩm (Shelf - Rack - Slot)
- Nhà cung cấp, loại sản phẩm

**Summary Cards:**
- Tổng số sản phẩm
- Sản phẩm sắp hết
- Sản phẩm hết hàng
- Tổng giá trị kho

---

### 2. Báo Cáo Nhập Hàng
**Endpoint:** `GET /reports/goods-receipt?startDate=2024-01-01&endDate=2024-12-31&supplierId=1`

**Thông tin:**
- Danh sách phiếu nhập hàng
- Thống kê theo ngày/tháng/năm
- Thống kê theo nhà cung cấp
- Nhân viên nhập hàng

**Summary Cards:**
- Tổng số phiếu nhập
- Tổng số lượng sản phẩm
- Tổng tiền nhập hàng
- Trung bình/phiếu

---

### 3. Báo Cáo Bán Hàng
**Endpoint:** `GET /reports/sales?startDate=2024-01-01&endDate=2024-12-31&employeeId=50`

**Thông tin:**
- Danh sách hóa đơn
- Thống kê doanh thu theo khoảng thời gian
- Theo nhân viên (employeeId)
- Theo khách hàng (userId)

**Summary Cards:**
- Tổng hóa đơn
- Tổng doanh thu
- Tổng số lượng SP bán
- Trung bình/hóa đơn
- Tổng điểm khách dùng

---

### 4. Báo Cáo Khách Hàng Thành Viên
**Endpoint:** `GET /reports/customer?orderBy=totalSpent`

**Thông tin:**
- Danh sách khách hàng
- Số điểm tích lũy còn lại
- Khách hàng mua nhiều nhất
- Khách dùng nhiều điểm nhất

**Summary Cards:**
- Tổng khách hàng
- Tổng điểm hiện tại
- Tổng chi tiêu
- Tổng điểm đã dùng
- Trung bình chi tiêu/KH

**orderBy options:**
- `point` - Sắp xếp theo điểm còn lại (mặc định)
- `totalSpent` - Sắp xếp theo tổng chi tiêu

---

### 5. Báo Cáo Kiểm Kê
**Endpoint:** `GET /reports/stocktaking?startDate=2024-01-01&endDate=2024-12-31&hasDiscrepancy=true`

**Thông tin:**
- Danh sách phiếu kiểm kê
- Sản phẩm có chênh lệch giữa thực tế và hệ thống
- So sánh số lượng: System vs Actual

**Summary Cards:**
- Tổng phiếu kiểm kê
- Tổng SP đã kiểm
- Số lượng chênh lệch
- Tổng SL chênh lệch

**hasDiscrepancy options:**
- `true` - Chỉ lấy SP có chênh lệch
- `false` - Chỉ lấy SP không chênh lệch
- `undefined` - Lấy tất cả

---

### 6. Báo Cáo Doanh Thu & Lợi Nhuận
**Endpoint:** `GET /reports/revenue-profit?startDate=2024-01-01&endDate=2024-12-31&groupBy=time`

**Thông tin:**
- Tổng doanh thu
- Tổng chi phí (từ phiếu nhập)
- Lợi nhuận = Doanh thu - Chi phí
- Tỷ suất lợi nhuận (%)

**Summary Cards:**
- Doanh thu
- Chi phí
- Lợi nhuận
- Tỷ suất LN (%)

**groupBy options:**
- `time` - Tổng hợp theo thời gian (mặc định)
- `product` - Thống kê theo từng sản phẩm
- `category` - Thống kê theo loại sản phẩm

---

## 🚀 Cách Sử Dụng

### 1. Khởi động Server & Client

```bash
# Terminal 1 - Server
cd HeThongQuanLyTapHoa
cd server
npm run dev

# Terminal 2 - Client
cd HeThongQuanLyTapHoa
cd client
npm run dev
```

### 2. Truy cập Reports

1. Đăng nhập với tài khoản Manager: `vvquan / 123456`
2. Click menu "Báo cáo" (Reports)
3. Chọn loại báo cáo từ dropdown
4. Nhập khoảng thời gian (nếu cần)
5. Click "Xem báo cáo"
6. Click "Xuất Excel" để tải file

---

## 📦 API Endpoints Summary

| Loại Báo Cáo | Method | Endpoint | Auth |
|--------------|--------|----------|------|
| Tồn kho | GET | `/reports/inventory` | MANAGER |
| Nhập hàng | GET | `/reports/goods-receipt` | MANAGER |
| Bán hàng | GET | `/reports/sales` | MANAGER |
| Khách hàng | GET | `/reports/customer` | MANAGER |
| Kiểm kê | GET | `/reports/stocktaking` | MANAGER |
| Doanh thu/LN | GET | `/reports/revenue-profit` | MANAGER |

**Authorization:** Tất cả endpoints yêu cầu token và position = MANAGER

---

## 🧪 Test Scenarios

### Test 1: Báo Cáo Tồn Kho
```
1. Login: vvquan / 123456
2. Vào "Báo cáo"
3. Chọn: "Báo cáo tồn kho"
4. Click "Xem báo cáo"
5. Kiểm tra:
   - Summary cards hiển thị đúng
   - Tổng SP, SP sắp hết, hết hàng
6. Click "Xuất Excel"
7. Mở file Excel kiểm tra dữ liệu
```

### Test 2: Báo Cáo Bán Hàng
```
1. Chọn: "Báo cáo bán hàng"
2. Nhập: Từ ngày 2024-01-01, Đến ngày 2024-12-31
3. Click "Xem báo cáo"
4. Kiểm tra:
   - Tổng HĐ, doanh thu
   - Summary cards
5. Xuất Excel và kiểm tra
```

### Test 3: Báo Cáo Khách Hàng
```
1. Chọn: "Báo cáo khách hàng"
2. Click "Xem báo cáo"
3. Kiểm tra:
   - Danh sách khách hàng
   - Điểm tích lũy, chi tiêu
4. Xuất Excel
```

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module 'exceljs'"
```bash
# Client
cd client
npm install exceljs file-saver
npm install --save-dev @types/file-saver

# Server
cd server
npm install exceljs
```

### Lỗi: 401 Unauthorized
- Kiểm tra token còn hạn không (15 phút)
- Login lại với tài khoản MANAGER

### Lỗi: 403 Forbidden
- Chỉ MANAGER mới có quyền xem báo cáo
- Check position trong token: `vvquan` có position = MANAGER

### Báo cáo không có dữ liệu
- Kiểm tra database có data không
- Thử tạo vài invoice, good receipt trước

### Xuất Excel bị lỗi
- Check console logs (F12)
- Kiểm tra báo cáo đã tải chưa (phải click "Xem báo cáo" trước)

---

## 📁 Cấu Trúc Files

### Backend
```
server/src/
├── application/
│   ├── get-inventory-report.usecase.ts
│   ├── get-goods-receipt-report.usecase.ts
│   ├── get-sales-report.usecase.ts
│   ├── get-customer-report.usecase.ts
│   ├── get-stocktaking-report.usecase.ts
│   └── get-revenue-profit-report.usecase.ts
├── infrastructure/
│   └── read-accessors/
│       └── report.read-accessor.ts (400+ lines)
├── domain/
│   └── services/
│       └── excel-export.service.ts (optional)
└── presentation/
    └── routes/
        └── report.route.ts
```

### Frontend
```
client/src/
├── services/
│   └── report.service.ts (450+ lines)
└── components/
    └── management/
        └── Reports.tsx (600+ lines)
```

---

## 🎯 Next Steps

1. **Test tất cả báo cáo** với dữ liệu thực
2. **Kiểm tra Excel export** - file có đúng format không
3. **Thêm charts** (optional):
   - Bar chart cho doanh thu theo tháng
   - Pie chart cho phân bổ theo loại SP
   - Line chart cho xu hướng bán hàng
4. **Optimize queries** nếu data lớn (pagination, indexing)
5. **Add filters** nâng cao:
   - Filter theo supplier cho báo cáo tồn kho
   - Filter theo category cho báo cáo bán hàng

---

## ✅ Checklist Hoàn Thành

- [x] Backend API (6 endpoints)
- [x] Frontend UI (combobox, date picker, buttons)
- [x] Excel export (6 export functions)
- [x] Summary cards động
- [x] Authorization (MANAGER only)
- [x] Error handling
- [x] Dependencies installed
- [ ] Tested all reports
- [ ] Excel files verified
- [ ] Performance optimized

---

**Status:** ✅ SẴN SÀNG TEST

**Test now:**
1. Restart server: `cd server && npm run dev`
2. Restart client: `cd client && npm run dev`
3. Login: `vvquan / 123456`
4. Vào menu "Báo cáo"
5. Test từng loại báo cáo
6. Xuất Excel và kiểm tra file
